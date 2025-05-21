const instructions = {
    MOV_LIT_REG: 0x10,
    MOV_REG_REG: 0x11, 
    MOV_REG_MEM: 0x12, 
    MOV_MEM_REG: 0x13, 
    ADD_REG_REG: 0x14,
    JMP_NOT_EQ: 0x15,
}
const hexToAssembly = Object.entries(instructions).reduce((map, element) => {
    const value = element[1].toString(16).padStart(4, "0x" );
    const name = element[0];
    return map.set(value, name);
}, new Map());


export { instructions, hexToAssembly }