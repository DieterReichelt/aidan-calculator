import { ThemeManager } from './ui/theme-manager.js';
import { TabManager } from './ui/tab-manager.js';
import { ScientificCalculator } from './calculators/scientific.js';
import { AdvancedParserCalculator } from './calculators/advanced.js';
import { TrigonometryCalculator } from './calculators/trigonometry.js';
import { GrapherCalculator } from './calculators/grapher.js';
import { SolverCalculator } from './calculators/solver.js';
import { BaseConverterCalculator } from './calculators/base-converter.js';
import { FractionCalculator } from './calculators/fraction.js';
import { ColumnMathCalculator } from './calculators/column-math.js';
import { PowersCalculator } from './calculators/powers.js';
import { GeometryCalculator } from './calculators/geometry.js';
import { FactorsCalculator } from './calculators/factors.js';
import { StatisticsCalculator } from './calculators/statistics.js';
import { MatrixCalculator } from './calculators/matrix.js';
import { FinanceCalculator } from './calculators/finance.js';
import { BytesCalculator } from './calculators/bytes.js';
import { SubnetCalculator } from './calculators/subnet.js';

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  TabManager.init();
  
  const sciCalc = new ScientificCalculator();
  const advCalc = new AdvancedParserCalculator();
  const trigCalc = new TrigonometryCalculator();
  const graphCalc = new GrapherCalculator();
  const solverCalc = new SolverCalculator();
  const baseCalc = new BaseConverterCalculator();
  const fracCalc = new FractionCalculator();
  const columnCalc = new ColumnMathCalculator();
  const powersCalc = new PowersCalculator();
  const geomCalc = new GeometryCalculator();
  const factorsCalc = new FactorsCalculator();
  const statsCalc = new StatisticsCalculator();
  const matrixCalc = new MatrixCalculator();
  const financeCalc = new FinanceCalculator();
  const bytesCalc = new BytesCalculator();
  const subnetCalc = new SubnetCalculator();

  // Expose to global scope for HTML onclick handlers
  window.switchTab = TabManager.switchTab;
  window.toggleTheme = ThemeManager.toggleTheme;
  
  // Scientific Calculator handlers
  window.insertChar = (c) => sciCalc.insertChar(c);
  window.insertConst = (n) => sciCalc.insertConst(n);
  window.insertAns = () => sciCalc.insertAns();
  window.clearSci = () => sciCalc.clear();
  window.backspace = () => sciCalc.backspace();
  window.calculateSci = () => sciCalc.calculate();
  window.clearSciHistory = () => sciCalc.clearHistory();
  window.calcSci = (f) => sciCalc.calcFunction(f);
  window.toggleAngleMode = () => sciCalc.toggleAngleMode();
  window.memoryAdd = () => sciCalc.memoryAdd();
  window.memorySubtract = () => sciCalc.memorySubtract();
  window.memoryRecall = () => sciCalc.memoryRecall();
  window.memoryClear = () => sciCalc.memoryClear();
  window.saveHistoryPDF = () => sciCalc.saveHistoryPDF();
  
  // Advanced Parser handlers
  window.insertAdv = (c) => advCalc.insertChar(c);
  window.clearAdv = () => advCalc.clear();
  window.backspaceAdv = () => advCalc.backspace();
  window.calculateAdv = () => advCalc.calculate();
  window.toggleAdvPlayback = () => advCalc.togglePlayback();
  window.advNextStep = () => advCalc.nextStep();
  window.advResetSteps = () => advCalc.resetSteps();
  window.updateAdvPlaybackSpeed = () => advCalc.stopPlayback();
  
  // Trigonometry handlers
  window.updateTrig = () => trigCalc.updateTrig();
  window.rectToPolar = () => trigCalc.rectToPolar();
  window.polarToRect = () => trigCalc.polarToRect();
  
  // Grapher handlers
  window.renderGraph = () => graphCalc.render();
  
  // Solver handlers
  window.solveLinear = () => solverCalc.solveLinear();
  window.solveQuadratic = () => solverCalc.solveQuadratic();
  
  // Base Converter handlers
  window.syncBase = (type) => baseCalc.syncBase(type);
  
  // Fraction handlers
  window.setFracOp = (op) => fracCalc.setOp(op);
  window.setActiveFrac = (el) => fracCalc.setActiveInput(el);
  window.keypadTypeFrac = (key) => fracCalc.keypadType(key);
  window.liveUpdateFrac = () => fracCalc.liveUpdate();
  window.calcFraction = () => fracCalc.calculate();
  window.swapFractions = () => fracCalc.swap();
  window.clearFraction = () => fracCalc.clear();
  window.simplifyFraction = () => fracCalc.simplifyResult();
  
  // Column Math handlers
  window.setActiveInput = (el) => columnCalc.setActiveInput(el);
  window.keypadType = (key) => columnCalc.keypadType(key);
  window.solveColumnMath = () => columnCalc.solve();
  
  // Powers handlers
  window.setActivePowInput = (el) => powersCalc.setActiveInput(el);
  window.keypadTypePow = (key) => powersCalc.keypadType(key);
  window.calcPower = () => powersCalc.calculate();
  
  // Geometry handlers
  window.updateGeomUI = () => geomCalc.updateUI();
  window.setActiveGeom = (el) => geomCalc.setActiveInput(el);
  window.keypadTypeGeom = (key) => geomCalc.keypadType(key);
  window.calcGeometry = () => geomCalc.calculate();
  
  // Factors handlers
  window.keypadTypeFactors = (key) => factorsCalc.keypadType(key);
  window.drawFactorTree = () => factorsCalc.drawTree();
  
  // Statistics handlers
  window.keypadTypeStats = (key) => statsCalc.keypadType(key);
  window.calcStats = () => statsCalc.calculate();
  window.saveStatsPDF = () => statsCalc.savePDF();

  // Matrix handlers
  window.setActiveMatrix = (el) => matrixCalc.setActiveInput(el);
  window.keypadTypeMatrix = (key) => matrixCalc.keypadType(key);
  window.calcMatrix = () => matrixCalc.calculate();

  // Finance handlers
  window.setActiveFinance = (el) => financeCalc.setActiveInput(el);
  window.keypadTypeFinance = (key) => financeCalc.keypadType(key);
  window.calcFinance = () => financeCalc.calculate();
  window.updateCurrencySymbol = () => financeCalc.updateCurrencySymbol();

  // Bytes handlers
  window.setActiveByteInput = (el) => bytesCalc.setActiveInput(el);
  window.keypadTypeBytes = (key) => bytesCalc.keypadType(key);
  window.syncBytes = (unit) => bytesCalc.sync(unit);

  // Subnet handlers
  window.setActiveSubnetInput = (el) => subnetCalc.setActiveInput(el);
  window.keypadTypeSubnet = (key) => subnetCalc.keypadType(key);
  window.calcSubnet = (source) => subnetCalc.calculate(source);
});

// PWA: register the service worker so the app installs and works offline (prod only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed:', err);
    });
  });
}