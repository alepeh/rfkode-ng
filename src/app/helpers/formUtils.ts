
  export function extractSchemaNameFromSchemaId(schemaId: string) {
    const schemaIdParts = schemaId.split(':');
    return schemaIdParts[1];
  }

  export function generateNewDocumentId(schemaId: string) {
    const schemaIdParts = schemaId.split(':');
    const schemaName = schemaIdParts[1];
    const schemaVersion = schemaIdParts[2];
    const randomString = Math.random().toString(36).replace('0.', '');
    return 'record:' + schemaName + ':' + schemaVersion + ':' + currentTimeFormatted() + ':' + randomString;
  }

 function currentTimeFormatted(){
    const date = new Date();
    return '' + date.getFullYear() 
              + padWith0(date.getMonth() + 1) 
              + padWith0(date.getDate()) 
              + padWith0(date.getHours())
              + padWith0(date.getMinutes())
              + padWith0(date.getSeconds());
}

function padWith0(num : number) : string{
  return (num < 10) ? "0" + num : num.toString();
}
