import { hexToAssembly, instructions } from "./instructions.js";
import {createMemory} from "./create-memory.js";

class CPU {
    constructor(memory){
        this.memory = memory;

        this.registersNames =
        [
           "ip", "acc", 
           "r1", "r2", "r3","r4", 
           "r5", "r6", "r7","r8",
           "sp","fp"
        ]

        // cria uma memoria de 16 bits para cada reg que será todos os reg que temos
        // esse é a palavra, logo, o nome do processador
        this.registers = createMemory(this.registersNames.length * 2);

        this.registersMap = this.registersNames.reduce((map, name, i) => {
            map[name] = i * 2 
            return map
            }, {}
        );

    }
    debug(){
        this.registersNames.forEach(name => {
            console.log(`${name}: ${this.getRegister(name).toString(16).padStart(4,0)}`)  
        })
        console.log(" ")
    }

    // para debug tambem
    viewMemoryAt(address){
        /* 
            As vezes nossa CPU lida com os dados como 2 bytes
            As vezes como 16 bit, uma palavra 
        */

            const nextEightBytes = Array.from({length: 8}, 
                (_, i) => this.memory.getUint8(address + i))
                .map( v => v.toString(16).padStart(4, '0x'));

            let encoded = this.memory.getUint8(address);
            const decoded = hexToAssembly.get(encoded.toString(16).padStart(4, '0x'))

            switch(decoded){
                case "MOV_LIT_REG": {
                    address += 1;
                    const value = this.memory.getUint16(address);
                    address += 2
                    const reg = this.memory.getUint8(address);
                    console.log(`
                    OP: MOV LIT REG 
                    LIT: ${value.toString(16)} 
                    REG ${this.registersNames[reg.toString(16) % this.registersNames.length]}
                    `)
                    break;
                }
                case "MOV_MEM_REG": {
                    address += 1;
                    const value = this.memory.getUint16(address);
                    address += 2
                    const reg = this.memory.getUint8(address);
                    console.log(`
                    OP: MOV MEM REG 
                    VALUE FROM ADDR: ${value.toString(16).padStart(4, '0x')} 
                    REG ${this.registersNames[reg.toString(16) % this.registersNames.length]}
                    `)
                    break;
                }
                default: {
                    
                }

            }

        // console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`); 
    }

    getRegister(name){
        if(!(name in this.registersMap)){
            throw new Error(`getRegister: No such register '${name}'`)
        }
        return this.registers.getUint16(this.registersMap[name]);
    } 
    setRegister(name, value){
        if(!(name in this.registersMap)){
            throw new Error(`setRegister: No such register '${name}'`)
        }
        return this.registers.setUint16(this.registersMap[name], value);
    }
    fetch(){
        const nextInstructionAddress = this.getRegister("ip");
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 1);
        return instruction;
    }
    fetch16(){
        const nextInstructionAddress = this.getRegister("ip");
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 2);
        return instruction;
    }

    execute(instruction){
        switch(instruction){
            /*
                Move um valor para o registrador

                basicamente, temos no opcode o reg que o programador quer usar. 
                Esses REG de uso geral sao visiveis ao programador (exceto em caso de renomeacao, do RISC)

                E dividimos com o operador de resto para garantir que estejamos no limite
                
                Por exemplo: 
                            6 (REG da instrucao) % 10 (total da nossa memoria): 6
                            O REG esta no limte, agora, precisamos achar seu endereco 
                            Como e uma VM, e nossa memoria e um array, seu index
                            Nossos registradores tem 2 bytes, entao o indice deve ter o dobro do
                            nome do REG => 6 * 2: 12

                Por exemplo: 
                            36 (REG da instrucao) % 10 (total da nossa memoria):  6
                            36 nao esta no limite, mas seu resto de divisao esta
                            nome do REG => 6 * 2: 12            
             */
            case instructions.MOV_LIT_REG: {
                const literal = this.fetch16();
                const register = (this.fetch() % this.registersNames.length) * 2;
                this.registers.setUint16(register, literal);
                break;
            }
            // move um valor de um registrador para outro registrador
            case instructions.MOV_REG_REG: {
                const registerFrom = (this.fetch() % this.registersNames.length) * 2;
                const registerTo = (this.fetch() % this.registersNames.length) * 2;
                const value = this.registers.getUint16(registerFrom);
                this.register.setUint16(registerTo, value);
                break;
            }
            
            case instructions.MOV_REG_MEM: {
                const registerFrom = (this.fetch() % this.registersNames.length) * 2;
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                this.memory.setUint16(address, value);
                break;
            }
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = (this.fetch() % this.registersNames.length) * 2;
                const value = this.memory.getUint16(address);
                this.registers.setUint16(registerTo, value);
                break;
            }
            case instructions.ADD_REG_REG: {
                const r1 = this.fetch();
                const r2 = this.fetch();

                const reg1 = this.registers.getUint16(r1 * 2);
                const reg2 = this.registers.getUint16(r2 * 2);
                this.setRegister("acc", reg1 + reg2);
                break;
            }
            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();

                if(value != this.getRegister("acc")){
                    this.setRegister("ip", address);
                }
                break;
            }
        }
    }
    step(){
        const instruction = this.fetch();
        return this.execute(instruction);
    }


}

export default CPU;