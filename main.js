// Do node



import CPU from "./src/cpu.js";
import {createMemory} from "./src/create-memory.js";
import { instructions } from "./src/instructions.js";
import MemoryMapper from './src/memory-mapper.js';
import createScreenDevice from './src/screen-device.js';

const memory = createMemory(256*256);
const MM = new MemoryMapper();
MM.map(memory, 0, 0xffff);

// Map 0xff bytes of the address space to an "output device"
MM.map(createScreenDevice(), 0x3000, 0x30FF, true);

const cpu = new CPU(MM);

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

const writeCharToScreen = (char, command, position) => 
{
    writebleBytes[i++] = instructions.MOV_LIT_REG;
    writebleBytes[i++] = command;
    writebleBytes[i++] = char.charCodeAt(0);
    writebleBytes[i++] = R1;

    writebleBytes[i++] = instructions.MOV_REG_MEM;
    writebleBytes[i++] = R1;
    writebleBytes[i++] = 0x30;
    writebleBytes[i++] = position;
}

writeCharToScreen(" ", 0xFF, 0) // clear screen

for(let index = 0; index <= 0xFF; index++){
    const command = index % 2 === 0 ? 
        0x01 // bold
        : 0x02 // regular
        
    writeCharToScreen('*', command, index);
}
writebleBytes[i++] = instructions.HLT;

cpu.run();
