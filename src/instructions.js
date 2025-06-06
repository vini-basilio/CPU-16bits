const instructions = {
    MOV_LIT_REG: 0x10,
    MOV_REG_REG: 0x11,
    MOV_REG_MEM: 0x12,
    MOV_LIT_MEM: 0x1B,
    MOV_REG_PTR_REG: 0x1C,
    MOV_LIT_OFF_REG: 0x1D,
    MOV_MEM_REG: 0x13,

    ADD_REG_REG: 0x14,
    ADD_LIT_REG: 0x3F,
    SUB_LIT_REG: 0x16,
    SUB_REG_LIT: 0x1E,
    SUB_REG_REG: 0x1F,
    INC_REG: 0x35,
    DEC_REG: 0x36,
    MUL_LIT_REG: 0x20,
    MUL_REG_REG: 0x21,

    JMP_NOT_EQ: 0x15,
    PSH_LIT: 0x17,
    PSH_REG: 0x18,
    POP: 0x1A,
    // Chama subrotina de um endereco na memoria
    CAL_LIT: 0x5E,
    // Chama subrotina de um REG
    CAL_REG: 0x5F,
    // Informa que a subrotina terminou
    RET: 0x06,
    HLT: 0xFF,
};
const hexToAssembly = Object.entries(instructions).reduce((map, element) => {
    const value = element[1].toString(16).padStart(4, "0x");
    const name = element[0];
    return map.set(value, name);
}, new Map());


export {instructions, hexToAssembly};