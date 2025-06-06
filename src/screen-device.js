const moveTo = (x,y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
}

const setBold = () => {
    process.stdout.write("\x1b[1m");
}

const setRegular = () => {
    process.stdout.write("\x1b[0m");
}

const eraseScreen = () => {
    process.stdout.write("\x1b[2J");
}

const createScreenDevice = ()=> {
    return {
        getUint16: () => 0,
        getUint8: () => 0,
        setUint16: (address, data) => {
            const command = (data & 0xFF00) >> 8;
            const characterValue = data & 0x00FF;


            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;


            switch(command){
                case 0xFF: {
                    eraseScreen();
                    break;
                }
                case 0x01: {
                    setBold();
                    break;
                }
                case 0x02: {
                    setRegular();
                    break;
                }
                default:{}

            }

            moveTo(x * 2,y);

            const characater = String.fromCharCode(characterValue);
            process.stdout.write(characater);
        }
    }
}

export default createScreenDevice;