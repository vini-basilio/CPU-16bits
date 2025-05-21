// Do node
import * as readline from 'node:readline/promises';
import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';


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

writebleBytes[i++] = instructions.MOV_MEM_REG;
writebleBytes[i++] = 0x01;
writebleBytes[i++] = 0x00;
writebleBytes[i++] = R1;

writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x00;
writebleBytes[i++] = 0x01;
writebleBytes[i++] = R2;

writebleBytes[i++] = instructions.ADD_REG_REG;
writebleBytes[i++] = R1; 
writebleBytes[i++] = R2; 

writebleBytes[i++] = instructions.MOV_REG_MEM;
writebleBytes[i++] = ACC;  
writebleBytes[i++] = 0x01;
writebleBytes[i++] = 0x00; 

writebleBytes[i++] = instructions.JMP_NOT_EQ;
writebleBytes[i++] = 0x00; 
writebleBytes[i++] = 0x03;

writebleBytes[i++] = 0x00;
writebleBytes[i++] = 0x00;

const cpu = new CPU(memory);

cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.debug();
// cpu.viewMemoryAt(0x0100);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.on("line", () => {

    cpu.step();
    cpu.viewMemoryAt(cpu.getRegister("ip"));
    cpu.debug();
    // cpu.viewMemoryAt(0x0100);
    console.log(" ");

})