import CPU from "./src/cpu.js";
import {createMemory} from "./src/create-memory.js";
import { instructions } from "./src/instructions.js";

const memory = createMemory(256*256);
const writebleBytes = new Uint8Array(memory.buffer);

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

let i = 0;

writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x00;
writebleBytes[i++] = 0x01;
writebleBytes[i++] = R1;

writebleBytes[i++] =  instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x00;
writebleBytes[i++] = 0x0A;
writebleBytes[i++] = R2;

writebleBytes[i++] = instructions.ADD_REG_REG;
writebleBytes[i++] = R1; 
writebleBytes[i++] = R2; 

writebleBytes[i++] = instructions.MOV_REG_MEM;
writebleBytes[i++] = ACC;  
// coloca o valor no final do programa 
// endereco 0x0100
writebleBytes[i++] = 0x01;
writebleBytes[i++] = 0x00; 

const cpu = new CPU(memory);

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
console.log(" ")
cpu.step();

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
console.log(" ")
cpu.step();

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
console.log(" ")
cpu.step();

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
cpu.step();

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
cpu.step();
