const app = require("./app.js");
const dataBase = require("./dataBase/db.js");
const {
  STORE_AVATARS_DIRECTORY,
  UPLOAD_DIRECTORY,
} = require("./middlewares/multer.js");
const initializeDirectory = require("./utils.js");

const PORT = 3000;

dataBase
  .then(() => {
    app.listen(PORT, async () => {
      await initializeDirectory(UPLOAD_DIRECTORY);
      await initializeDirectory(STORE_AVATARS_DIRECTORY);
      console.log(`Server running. Use our API on port: ${PORT}.`);
    });
  })
  .catch((error) => {
    console.log(`Server not run. Error:${error.message}`);
  });
