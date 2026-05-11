const { databasePath, getDatabase } = require("./database");

const db = getDatabase();
const placeCount = db.prepare("SELECT COUNT(*) AS total FROM places").get().total;

console.log(`SQLite listo en ${databasePath}`);
console.log(`Lugares cargados: ${placeCount}`);
