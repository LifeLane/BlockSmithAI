import { PrismaClient, PositionStatus, SignalType, PositionType, SignalStatus } from '@prisma/client'
import { add } from 'date-fns';

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Clean up existing data
  await prisma.position.deleteMany();
  await prisma.generatedSignal.deleteMany();
  await prisma.user.deleteMany();

  console.log('Old data cleaned up.');

  const user = await prisma.user.create({
    data: {
      username: 'Shadow_Operator_007',
      shadowId: `SHDW-${'OPERATOR'.substring(0, 7).toUpperCase()}`,
      weeklyPoints: 1250,
      airdropPoints: 5500,
      status: 'Registered',
      claimedMissions: ['mission_first_signal', 'mission_x'],
      email: 'operator@blockshadow.ai',
      wallet_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      wallet_type: 'ETH',
      x_handle: '@blockshadow_ai'
    },
  })

  console.log(`Created user with id: ${user.id}`);

  // Create sample positions
  await prisma.position.createMany({
    data: [
      {
        userId: user.id,
        symbol: 'BTCUSDT',
        signalType: SignalType.BUY,
        status: PositionStatus.OPEN,
        entryPrice: 68000.50,
        stopLoss: 67000.00,
        takeProfit: 70000.00,
        openTimestamp: new Date(),
        type: PositionType.INSTANT,
        tradingMode: 'Intraday',
        riskProfile: 'Medium',
        gpt_confidence_score: '85',
        sentiment: 'Bullish',
      },
      {
        userId: user.id,
        symbol: 'ETHUSDT',
        signalType: SignalType.SELL,
        status: PositionStatus.CLOSED,
        entryPrice: 3800.00,
        closePrice: 3750.00,
        stopLoss: 3850.00,
        takeProfit: 3700.00,
        openTimestamp: add(new Date(), { days: -2 }),
        closeTimestamp: add(new Date(), { days: -1 }),
        pnl: 50.00,
        gainedXp: 150,
        gainedAirdropPoints: 200,
        gasPaid: 1.5,
        blocksTrained: 250,
        type: PositionType.CUSTOM,
        tradingMode: 'Swing',
        riskProfile: 'High',
        gpt_confidence_score: '78',
        sentiment: 'Bearish',
      },
      {
        userId: user.id,
        symbol: 'SOLUSDT',
        signalType: SignalType.BUY,
        status: PositionStatus.PENDING,
        entryPrice: 165.00,
        stopLoss: 160.00,
        takeProfit: 175.00,
        expirationTimestamp: add(new Date(), { hours: 24 }),
        type: PositionType.CUSTOM,
        tradingMode: 'Sniper',
        riskProfile: 'Medium',
        gpt_confidence_score: '92',
        sentiment: 'Very Bullish',
      },
    ]
  });

  console.log('Created sample positions.');

  await prisma.generatedSignal.createMany({
    data: [
        {
            userId: user.id,
            symbol: 'AVAXUSDT',
            signal: 'BUY',
            entry_zone: '35.50',
            stop_loss: '34.00',
            take_profit: '38.00',
            confidence: 'High',
            risk_rating: 'Medium',
            gpt_confidence_score: '88',
            sentiment: 'Bullish',
            currentThought: 'Breakout from consolidation pattern imminent.',
            shortTermPrediction: 'Price to test resistance at $38 within 4 hours.',
            type: 'CUSTOM',
            status: SignalStatus.PENDING_EXECUTION,
            disclaimer: 'This is not financial advice. Your capital is at risk.'
        },
        {
            userId: user.id,
            symbol: 'LINKUSDT',
            signal: 'SELL',
            entry_zone: '18.50',
            stop_loss: '19.00',
            take_profit: '17.00',
            confidence: 'Medium',
            risk_rating: 'High',
            gpt_confidence_score: '75',
            sentiment: 'Bearish',
            currentThought: 'Losing momentum after failing to break key resistance.',
            shortTermPrediction: 'Pullback towards $17 support level expected.',
            type: 'CUSTOM',
            status: SignalStatus.EXECUTED,
            disclaimer: 'This is not financial advice. Your capital is at risk.'
        }
    ]
  });
   console.log('Created sample generated signals.');

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
