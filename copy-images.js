const fs = require('fs');

const srcKitchen = 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/bed07bb4-11e5-4dc6-b1c3-46b249fafb3e/curated_kitchen_interior_1781189525009.png';
const destKitchen = 'e:/work/Trail vibrant/ag ATMP day 2/hero-app/public/kitchen.png';

const srcOffice = 'C:/Users/ADMIN/.gemini/antigravity-ide/brain/bed07bb4-11e5-4dc6-b1c3-46b249fafb3e/office_headquarters_lobby_1781189549049.png';
const destOffice = 'e:/work/Trail vibrant/ag ATMP day 2/hero-app/public/office.png';

try {
  fs.copyFileSync(srcKitchen, destKitchen);
  fs.copyFileSync(srcOffice, destOffice);
  console.log("Images copied successfully via write_to_file execution!");
} catch (e) {
  console.error("Node file operation error: ", e);
}
