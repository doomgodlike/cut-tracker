// Recipe database from recipe-database-for-tracker.md
// All IP recipes: cook once → 4 plates (his dinner + her dinner, his lunch + her lunch)

export const IP_RECIPES = [
  { id: 1, nm: 'Ginger sesame chicken rice', cal: 464, p: 44, f: 8, c: 54, heat: 2, cat: 'Asian fusion', time: 28, water: 350 },
  { id: 2, nm: 'Chicken bibimbap', cal: 461, p: 43, f: 9, c: 52, heat: 2, cat: 'Korean', time: 30, water: 350 },
  { id: 3, nm: 'Cajun chicken rice', cal: 461, p: 43, f: 8, c: 54, heat: 2, cat: 'American South', time: 30, water: 350 },
  { id: 4, nm: 'Honey garlic chicken + rice', cal: 461, p: 42, f: 9, c: 54, heat: 1, cat: 'Chinese', time: 32, water: 420 },
  { id: 5, nm: 'Hainanese-style chicken rice', cal: 470, p: 43, f: 10, c: 52, heat: 1, cat: 'SE Asian', time: 35, water: 350 },
  { id: 6, nm: 'Teriyaki chicken + veggie rice', cal: 461, p: 43, f: 8, c: 54, heat: 1, cat: 'Japanese', time: 28, water: 350 },
  { id: 7, nm: 'Chicken biryani (lean)', cal: 449, p: 42, f: 7, c: 54, heat: 2, cat: 'Indian', time: 31, water: 330 },
  { id: 8, nm: 'Chicken dal khichdi', cal: 389, p: 40, f: 5, c: 46, heat: 1, cat: 'Indian comfort', time: 32, water: 650, note: '330g breast + 70g keema' },
  { id: 9, nm: 'Keema pulao', cal: 431, p: 38, f: 7, c: 54, heat: 2, cat: 'Indian', time: 26, water: 380, note: 'All mince, no breast' },
  { id: 10, nm: 'Chicken tikka masala rice', cal: 482, p: 44, f: 10, c: 54, heat: 3, cat: 'North Indian', time: 35, water: 300 },
  { id: 11, nm: 'Spicy chicken pulao', cal: 461, p: 43, f: 8, c: 54, heat: 3, cat: 'Hyderabadi', time: 30, water: 350 },
  { id: 12, nm: 'Chettinad chicken rice', cal: 473, p: 44, f: 9, c: 54, heat: 4, cat: 'South Indian', time: 35, water: 350 },
  { id: 13, nm: 'Andhra chili chicken rice', cal: 465, p: 44, f: 8, c: 54, heat: 5, cat: 'Andhra', time: 32, water: 350 },
  { id: 14, nm: 'Kolhapuri chicken rice', cal: 482, p: 44, f: 10, c: 54, heat: 4, cat: 'Maharashtrian', time: 35, water: 320 },
  { id: 15, nm: 'Pepper chicken rice', cal: 473, p: 44, f: 9, c: 54, heat: 3, cat: 'Kerala', time: 30, water: 350 },
]

export const BREAKFASTS = [
  { id: 'b1', nm: 'Classic egg + toast', desc: '4w+2wh, 2 bread, ghee, whey', cal: 554, p: 57, f: 22, c: 32, heat: 0, effort: 1 },
  { id: 'b2', nm: 'Masala scrambled egg + toast', desc: 'Onion, tomato, green chili', cal: 566, p: 57, f: 23, c: 34, heat: 1, effort: 2 },
  { id: 'b3', nm: 'Savoury oats + eggs', desc: '50g oats, 3e+2wh, whey', cal: 574, p: 55, f: 18, c: 48, heat: 1, effort: 2, oats: 50 },
  { id: 'b4', nm: 'Overnight oats + boiled eggs', desc: 'Whey in oats, 3 boiled eggs', cal: 542, p: 52, f: 14, c: 52, heat: 0, effort: 0, oats: 50 },
  { id: 'b5', nm: 'Spicy egg bhurji + toast', desc: 'Pav bhaji masala, 2 green chili', cal: 578, p: 57, f: 24, c: 34, heat: 2, effort: 2 },
  { id: 'b6', nm: 'Boiled eggs + toast', desc: '5 eggs + 2 bread + whey (ZERO EFFORT)', cal: 542, p: 56, f: 22, c: 30, heat: 0, effort: 0 },
  { id: 'b7', nm: 'Omelette roti wrap', desc: '4e+2wh omelette, 1 roti, whey', cal: 562, p: 55, f: 22, c: 36, heat: 0, effort: 1 },
]

export const QUICK_ITEMS = [
  { nm: '1 whole egg', cal: 78, p: 6, f: 5, c: 1 },
  { nm: '1 egg white', cal: 17, p: 4, f: 0, c: 0 },
  { nm: '1 scoop whey', cal: 117, p: 25, f: 2, c: 3 },
  { nm: '1 bread slice', cal: 80, p: 4, f: 1, c: 14 },
  { nm: '1 tsp ghee', cal: 45, p: 0, f: 5, c: 0 },
  { nm: 'Banana', cal: 100, p: 1, f: 0, c: 27 },
  { nm: 'Black coffee', cal: 5, p: 0, f: 0, c: 0 },
  { nm: 'Masala chai', cal: 60, p: 2, f: 2, c: 8 },
  { nm: 'Almonds (15 pcs)', cal: 100, p: 4, f: 9, c: 3 },
  { nm: 'Peanuts (30g)', cal: 170, p: 7, f: 14, c: 5 },
  { nm: 'Buttermilk (1 glass)', cal: 40, p: 3, f: 1, c: 5 },
  { nm: 'Greek yogurt (200g)', cal: 130, p: 20, f: 0, c: 8 },
  { nm: 'Protein bar', cal: 200, p: 20, f: 8, c: 20 },
  { nm: 'Chapati (1)', cal: 120, p: 3, f: 3, c: 20 },
  { nm: 'Rice (100g cooked)', cal: 130, p: 3, f: 0, c: 28 },
  { nm: 'Chicken breast (100g)', cal: 165, p: 31, f: 4, c: 0 },
]

export const SNACK_ITEMS = [
  { nm: 'Junk snack budget (~175 cal)', cal: 175, p: 3, f: 8, c: 22 },
  { nm: 'Biscuits (2)', cal: 120, p: 1, f: 5, c: 18 },
  { nm: 'Samosa (1)', cal: 250, p: 4, f: 14, c: 28 },
  { nm: 'Vada pav (1)', cal: 290, p: 5, f: 15, c: 35 },
  { nm: 'Chips (small pack)', cal: 150, p: 2, f: 9, c: 15 },
]

export const MACRO_TARGETS = {
  training: { cal: 2025, protein: 150, carbs: 190, fat: 65 },
  rest: { cal: 1825, protein: 150, carbs: 140, fat: 65 },
}

export const TRAINING_DAYS = ['Mon', 'Tue', 'Thu', 'Fri']
