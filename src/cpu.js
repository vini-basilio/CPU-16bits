import {createMemory} from "./create-memory.js";
import {instructions} from "./instructions.js";

class CPU {
    constructor(memory) {
        this.memory = memory;

        // Registradores publicos
        this.registersNames =
            [
                "ip", "acc",
                "r1", "r2", "r3", "r4",
                "r5", "r6", "r7", "r8",
                "sp", "fp",
            ];

        // cria uma memoria de 16 bits para cada reg que será todos os reg que temos
        // esse é a palavra, logo, o nome do processador
        this.registers = createMemory(this.registersNames.length * 2);

        this.registersMap = this.registersNames.reduce((map, name, i) => {
                map[name] = i * 2;
                return map;
            }, {}
        );

        // -1 para tirarmos um byte
        // e -1 porque queremos um index e nao o tamanho
        this.setRegister("sp", 0xffff - 1);
        this.setRegister("fp", 0xffff - 1);


        //Registradores privados
        this.stackFrameSize = 0;


    }

    // para debug tambem
    viewMemoryAt(address, n = 8) {
        /* 
            As vezes nossa CPU lida com os dados como 2 bytes
            As vezes como 16 bit, uma palavra 
        */

        const nextNtBytes = Array.from({length: n},
            (_, i) => this.memory.getUint8(address + i))
            .map(v => v.toString(16).padStart(4, "0x"));

        console.log(`         Current address: 0x${address.toString(16).padStart(4, "0")}
         Content: ${nextNtBytes.join(" ")}`);
    }

    // OP com REG
    getRegister(name) {
        if (!(name in this.registersMap)) {
            throw new Error(`getRegister: No such register '${name}'`);
        }
        return this.registers.getUint16(this.registersMap[name]);
    }

    setRegister(name, value) {
        if (!(name in this.registersMap)) {
            throw new Error(`setRegister: No such register '${name}'`);
        }
        return this.registers.setUint16(this.registersMap[name], value);
    }

    // OP de busca
    fetch() {
        const nextInstructionAddress = this.getRegister("ip");
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 1);
        return instruction;
    }

    fetch16() {
        const nextInstructionAddress = this.getRegister("ip");
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.setRegister("ip", nextInstructionAddress + 2);
        return instruction;
    }

    fetchRegisterIndex() {
        return (this.fetch() % this.registersNames.length) * 2;
    }

    //OP da Stacks
    //Mover o ponteiro
    push(value) {
        const spAddress = this.getRegister("sp");
        this.memory.setUint16(spAddress, value);
        this.setRegister("sp", spAddress - 2);
        this.stackFrameSize += 2;
    }

    pop() {
        const nextSpAddress = this.getRegister("sp") + 2;
        this.setRegister("sp", nextSpAddress);
        this.stackFrameSize -= 2;
        return this.memory.getUint16(nextSpAddress);
    }

    // Salvar o estado do processador para subrotinas
    pushState() {
        // Atualiza a stack com o que estava nos registradores
        // Como a stack fica na RAM, estamos salvando um estado
        // Isso não é o mesmo que salvar o Contexto
        for (let i = 2; i < 10; i++) {
            // console.log(this.registersNames[i])
            this.push(this.getRegister(this.registersNames[i]));

        }
        this.push(this.getRegister("ip"));
        this.push(this.stackFrameSize + 2);

        this.setRegister("fp", this.getRegister("sp"));
        this.stackFrameSize = 0;
    }

    popState() {
        const framePointerAddress = this.getRegister("fp");
        this.setRegister("sp", framePointerAddress);

        this.stackFrameSize = this.pop();
        const stackFrameSize = this.stackFrameSize;

        this.setRegister("ip", this.pop());
        this.setRegister("r8", this.pop());
        this.setRegister("r7", this.pop());
        this.setRegister("r6", this.pop());
        this.setRegister("r5", this.pop());
        this.setRegister("r4", this.pop());
        this.setRegister("r3", this.pop());
        this.setRegister("r2", this.pop());
        this.setRegister("r1", this.pop());

        const nArgs = this.pop();
        for (let i = 0; i < nArgs; i++) {
            this.pop();
        }

        this.setRegister("fp", framePointerAddress + stackFrameSize);
    }


    execute(instruction) {
        switch (instruction) {
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
                const register = this.fetchRegisterIndex();
                this.registers.setUint16(register, literal);
                break;
            }
            // move um valor de um registrador para outro registrador
            case instructions.MOV_REG_REG: {
                const registerFrom = this.fetchRegisterIndex();
                const registerTo = this.fetchRegisterIndex();
                const value = this.registers.getUint16(registerFrom);
                this.registers.setUint16(registerTo, value);
                break;
            }

            case instructions.MOV_REG_MEM: {
                const registerFrom = this.fetchRegisterIndex();
                const address = this.fetch16();
                const value = this.registers.getUint16(registerFrom);
                this.memory.setUint16(address, value);
                break;
            }
            case instructions.MOV_MEM_REG: {
                const address = this.fetch16();
                const registerTo = this.fetchRegisterIndex();
                const value = this.memory.getUint16(address);
                this.registers.setUint16(registerTo, value);
                break;
            }
            case instructions.MOV_LIT_MEM: {
                const value = this.fetch16();
                const address = this.fetch16();
                this.memory.setUint16(address, value);
                break;
            }
            // Ponteiro de registrador
            case instructions.MOV_REG_PTR_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();
                const ptr = this.registers.getUint16(r1);
                const value = this.memory.getUint16(ptr);
                this.registers.setUint16(r2, value);
                break;
            }
            // Move um valor [literal + registrador] para registrador
            case instructions.MOV_LIT_OFF_REG: {
                const baseAddress = this.fetch();
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();
                const offset = this.registers.getUint16(r1);
                const value = this.memory.getUint16(baseAddress + offset);
                this.registers.setUint16(r2, value);
                break;
            }
            case instructions.ADD_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);
                this.setRegister("acc", reg1 + reg2);
                break;
            }
            case instructions.ADD_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister("acc", literal + registerValue);
                break;
            }
            case instructions.SUB_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister("acc", registerValue - literal);
                break;
            }
            case instructions.SUB_REG_LIT: {
                const literal = this.fetch16();
                const r1 = this.fetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister("acc", literal - registerValue);
                break;
            }
            case instructions.SUB_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);

                this.setRegister("acc", reg1 - reg2);
                break;
            }
            case instructions.MUL_LIT_REG: {
                const literal = this.fetch16();
                const r1 = this.fetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.setRegister("acc", registerValue * literal);
                break;
            }
            case instructions.MUL_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);

                this.setRegister("acc", reg2 * reg1);
                break;
            }
            case instructions.INC_REG : {
                const r1 = this.fetchRegisterIndex();
                const oldValue = this.registers.getUint16(r1);
                const newValue = oldValue + 1;
                this.registers.setUint16(r1, newValue);
                break;
            }
            case instructions.DEC_REG : {
                const r1 = this.fetchRegisterIndex();
                const oldValue = this.registers.getUint16(r1);
                const newValue = oldValue - 1;
                this.registers.setUint16(r1, newValue);
                break;
            }
            case instructions.LSF_REG_LIT: {
                const r1 = this.fetchRegisterIndex();
                const literal = this.fetch();
                const registerValue = this.registers.getUint16(r1);
                const res = registerValue << literal;
                this.registers.setUint16(r1, res);
                break;
            }
            case instructions.LSF_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                const res = registerValue << shiftBy;

                this.registers.setUint16(r1, res);
                break;
            }
            case instructions.RSF_REG_LIT: {
                const r1 = this.fetchRegisterIndex();
                const literal = this.fetch();
                const registerValue = this.registers.getUint16(r1);
                const res = registerValue >> literal;
                this.registers.setUint16(r1, res);
                break;
            }
            case instructions.RSF_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const registerValue = this.registers.getUint16(r1);
                const shiftBy = this.registers.getUint16(r2);
                const res = registerValue >> shiftBy;

                this.registers.setUint16(r1, res);
                break;
            }
            case instructions.AND_REG_LIT: {
                const r1 = this.fetchRegisterIndex();
                const literal = this.fetch16();
                const registerValue = this.registers.getUint16(r1);

                const res = registerValue & literal;
                this.setRegister("acc", res);
                break;
            }
            case instructions.AND_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);

                const res = reg1 & reg2;
                this.setRegister("acc", res);
                break;
            }
            case instructions.OR_REG_LIT: {
                const r1 = this.fetchRegisterIndex();
                const literal = this.fetch16();
                const registerValue = this.registers.getUint16(r1);

                const res = registerValue | literal;
                this.setRegister("acc", res);
                break;
            }
            case instructions.OR_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);

                const res = reg1 | reg2;
                this.setRegister("acc", res);
                break;
            }
            case instructions.OR_REG_LIT: {
                const r1 = this.fetchRegisterIndex();
                const literal = this.fetch16();
                const registerValue = this.registers.getUint16(r1);

                const res = registerValue ^ literal;
                this.setRegister("acc", res);
                break;
            }
            case instructions.OR_REG_REG: {
                const r1 = this.fetchRegisterIndex();
                const r2 = this.fetchRegisterIndex();

                const reg1 = this.registers.getUint16(r1);
                const reg2 = this.registers.getUint16(r2);

                const res = reg1 ^ reg2;
                this.setRegister("acc", res);
                break;
            }
            case instructions.NOT: {
                const r1 = this.fetchRegisterIndex();

                const registerValue = this.registers.getUint16(r1);
                // Pequeno problema aqui: JS trabalha com 32 bit por padrao,
                // O not ira pegar todos os bits nao usados, porque so usamos 16
                // e flipar tambem. Entao, vamos apenas filtra-los
                const res = (~registerValue) & 0xFFFF;
                this.setRegister("acc", res);
                break;
            }
            case instructions.JMP_NOT_EQ: {
                const value = this.fetch16();
                const address = this.fetch16();

                if (value !== this.getRegister("acc")) {
                    this.setRegister("ip", address);
                }
                break;
            }
            case instructions.PSH_LIT: {
                const value = this.fetch16();
                this.push(value);
                break;
            }
            case instructions.PSH_REG: {
                const registerIndex = this.fetchRegisterIndex();
                this.push(this.registers.getUint16(registerIndex));
                break;
            }
            case instructions.POP: {
                const registerIndex = this.fetchRegisterIndex();
                const value = this.pop();
                this.registers.setUint16(registerIndex, value);
                break;
            }
            case instructions.CAL_LIT: {
                const address = this.fetch16();
                this.pushState();
                //Pula o instrution pointer para o endereco da subrotina
                this.setRegister("ip", address);
                break;
            }
            case instructions.CAL_REG: {
                const registsIndex = this.fetchRegisterIndex();
                const address = this.registers.getInt16(registsIndex);
                this.pushState();
                //Pula o instrution pointer para o endereco da subrotina
                this.setRegister("ip", address);
                break;
            }
            case instructions.RET: {
                this.popState();
                break;
            }
            case instructions.HLT: {
                return true;
            }

        }
    }

    step() {
        const instruction = this.fetch();
        return this.execute(instruction);
    }

    run() {
        const halt = this.step();
        if (!halt) {
            setImmediate(() => this.run());
        }
    }

}

export default CPU;