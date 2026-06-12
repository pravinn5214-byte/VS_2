const fs = require('fs');
try {
  fs.copyFileSync(
    "C:/Users/ADMIN/.gemini/antigravity-ide/brain/bed07bb4-11e5-4dc6-b1c3-46b249fafb3e/realistic_luxury_living_room_1781192065660.png",
    "e:/work/Trail vibrant/ag ATMP day 2/hero-app/public/luxury-living.png"
  );
  console.log("Success copy!");
} catch(err) {
  console.error(err);
}
