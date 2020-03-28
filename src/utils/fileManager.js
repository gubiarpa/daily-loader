const processFile = (config, content) => {
    /* I. Is not null file */
    if ((content == null) || (content == '')) {
        return false;
    }

    /* II. Split by line */
    // const lines = content.split('\n');
    const lines = content.split(/\r?\n/);

    /* III. Valid header (ej. 'Province/State,Country/Region,Last Update,Confirmed' */
    let header = lines[0].trim();
    let processedHeader = processHeader(config.definedHeader, header);

    if (!processedHeader.isValid){
        console.log({
            result: 'The fields in the upload file do not match the required fields.',
            matchDetail: processedHeader.matchArray,
            errorDetail: processedHeader.errorArray
        });
        return;
    }

    /* IV. Read body */
    for (const i in lines) {
        if (i > 0) {
            var records = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/);
            for (const i in records) {
                records[i] = records[i].replace(/"/g, '');
            }
        }
    }
}

const processHeader = (definedHeader, header) => {
    // (array, string) => {...}
    
    let isValid = false; // ¿Cabecera válida?
    let matchArray = []; // Lista campos con posiciones en CSV
    let errorArray = []; // Lista campos no encontrados

    try {

        let fields = header.split(','); // fields from file

        for (const definedfield of definedHeader) {
            // Ej. definedField.csvMatchName = ['Province/State', 'Province_State', 'Prov_Stat']
            
            if (definedfield.required == true) {

                let founded = false, matchPosition = -1, i = 0;

                while ((!founded) && (i < definedfield.csvMatchName.length)) {
                    let matchItem = definedfield.csvMatchName[i++];
                        // ej. matchItem = 'Province_State'
                    matchPosition = fields.findIndex((e) => e == matchItem);
                    founded = (matchPosition > -1);
                }

                if (founded) {
                    matchArray.push({ name: definedfield.name, index: matchPosition});
                } else {
                    errorArray.push({ name: definedfield.name });
                }
            }
        }

        isValid = (errorArray.length == 0);

    } catch (error) {
        isValid = false;
        matchArray = [];
        errorArray = [error];
    }

    return {
        isValid,
        matchArray,
        errorArray
    }
}

module.exports = processFile;