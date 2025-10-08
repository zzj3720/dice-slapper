# Getting Started with Dice Slapper

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to http://localhost:5173 (or the port shown in terminal)
   - You should see the 3D dice game

## How to Play

### Basic Controls

1. **Click on the table** anywhere to create a "slap" impact
   - The closer you click to a dice, the stronger the effect
   - Dice will bounce and roll based on physics

2. **Or use the Slap button** at the bottom center
   - This creates a centered slap on the table

3. **Wait for dice to stop**
   - Dice will naturally come to rest in 2-5 seconds
   - When all dice stop, your score is calculated automatically

4. **Camera Controls**
   - **Left mouse drag**: Rotate camera around the table
   - **Mouse wheel**: Zoom in/out
   - Camera movement is restricted to keep the table in view

### Understanding Scoring

The table is divided into a 3x3 grid with different multipliers:

```
┌─────┬─────┬─────┐
│ 1x  │ 2x  │ 1x  │
├─────┼─────┼─────┤
│ 2x  │ 3x  │ 2x  │  (Colored zones)
├─────┼─────┼─────┤
│ 1x  │ 2x  │ 1x  │
└─────┴─────┴─────┘
```

- **Score = Dice Face Value × Zone Multiplier**
- Example: A dice showing "6" in the center zone = 6 × 3 = 18 points
- All dice scores are added together

### Debug Panel

Click the **🔧 wrench icon** in the top-left corner to access debug tools:

- **FPS Counter**: Monitor performance
- **Show Zone Grid**: Toggle zone boundaries on/off
- **Dice States**: View real-time dice information
  - Stopped: Whether dice is moving
  - Face: Current top face number
  - Zone: Which zone the dice is in
- **Reset Score**: Clear your total score

## Tips & Tricks

1. **Strategic Clicking**
   - Click near the edge of a dice to create more spin
   - Click directly above for a straight bounce
   - Click far away for subtle movements

2. **Aiming for High Scores**
   - Try to get dice to land in the center (gold) zone for 3x multiplier
   - Rolling a "6" in the center gives maximum points (18)

3. **Multiple Dice**
   - You can slap while dice are still moving
   - All 3 dice must stop before scoring occurs

4. **Performance**
   - If FPS drops below 30, try closing other browser tabs
   - The game targets 60 FPS on modern hardware

## Troubleshooting

### Issue: Dice are not visible
**Solution**: Make sure WebGL is enabled in your browser
- Try a different browser (Chrome/Edge recommended)
- Update your graphics drivers

### Issue: Clicking doesn't do anything
**Solution**: 
- Make sure you're clicking on the table surface (not the walls)
- Check the browser console for errors (F12)

### Issue: No sound
**Solution**:
- Click anywhere on the page first (browser audio policy)
- Check your system volume
- Check browser audio permissions

### Issue: Performance is slow
**Solution**:
- Close other browser tabs
- Disable other applications
- Lower display resolution if on a laptop
- Check FPS in the debug panel

### Issue: Dice fly off the table
**Solution**: This shouldn't happen (there are walls), but if it does:
- Refresh the page
- Report as a bug

## Development Commands

### Build for Production
```bash
npm run build
```
Output will be in the `dist/` folder

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npx tsc --noEmit
```

## Browser Compatibility

**Recommended:**
- Chrome 90+
- Edge 90+
- Firefox 90+
- Safari 14+

**Requirements:**
- WebGL 2.0 support
- Modern JavaScript (ES2020+)

## Project Structure Overview

```
src/
├── game/          # Core game logic
├── ui/            # User interface components
├── App.tsx        # Main application
└── main.tsx       # Entry point
```

See `docs/IMPLEMENTATION_SUMMARY.md` for detailed architecture.

## Next Steps

- Read `docs/PLAN.md` to understand the full project vision
- Check `docs/IMPLEMENTATION_SUMMARY.md` for technical details
- Explore the code and modify as you like!

## Need Help?

- Check the browser console (F12) for error messages
- Review the implementation summary for technical details
- Examine the code comments for inline documentation

## Future Features (Coming in Phase 2)

- Hold to charge slap strength
- Drag to aim slaps
- More zone layouts
- Better graphics and effects
- Save/load system
- Upgrades and progression

Enjoy playing Dice Slapper! 🎲
