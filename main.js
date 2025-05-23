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
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const subroutineAddress = 0x3000;
let i = 0;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x33;
writebleBytes[i++] = 0x33;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x22;
writebleBytes[i++] = 0x22;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x11;
writebleBytes[i++] = 0x11;

writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x12;
writebleBytes[i++] = 0x34;
writebleBytes[i++] = R1; 

writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x56;
writebleBytes[i++] = 0x78;
writebleBytes[i++] = R4; 

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x00;
writebleBytes[i++] = 0x00;

writebleBytes[i++] = instructions.CAL_LIT;
writebleBytes[i++] = (subroutineAddress & 0xff00) >> 8;
writebleBytes[i++] = (subroutineAddress & 0x00ff);

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x44;
writebleBytes[i++] = 0x44;

i = subroutineAddress;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x01;
writebleBytes[i++] = 0x02;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x03;
writebleBytes[i++] = 0x04;

writebleBytes[i++] = instructions.PSH_LIT;
writebleBytes[i++] = 0x05;
writebleBytes[i++] = 0x06;


writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x07;
writebleBytes[i++] = 0x08;
writebleBytes[i++] = R1;

writebleBytes[i++] = instructions.MOV_LIT_REG;
writebleBytes[i++] = 0x09;
writebleBytes[i++] = 0x0A;
writebleBytes[i++] = R8;

writebleBytes[i++] = instructions.RET;

const cpu = new CPU(memory);

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
console.log("  ")
console.log("         Stack")
cpu.viewMemoryAt(0xffff - 1 - 42,44);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.on("line", () => {

    cpu.step();
    cpu.debug();
    cpu.viewMemoryAt(cpu.getRegister("ip"));
    console.log("  ")
    console.log("         Stack")
    cpu.viewMemoryAt(0xffff - 1- 42,44);
    console.log(" ");

})

