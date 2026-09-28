const router = require('express').Router();
const { getDb } = require('../db/init');

function toObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// GET /api/stats - Dashboard analytics & KPIs
router.get('/', async (req, res) => {
  try {
    const db = await getDb();

    const parcels = toObjects(db.exec(`SELECT * FROM parcels`));
    const finances = toObjects(db.exec(`SELECT * FROM finances`));

    const totalParcels = parcels.length;
    const completed = parcels.filter(p => p.status === 'completed' || p.current_stage === 'possession-transfer').length;
    const inProgress = totalParcels - completed;
    const overdueCases = parcels.filter(p => p.status === 'delayed').length;

    let totalComp = 0;
    let landCost = 0, solatium = 0, rehabilitation = 0, admin = 0;
    let totalPaid = 0;

    finances.forEach(f => {
      totalComp += f.total_award || 0;
      landCost += f.land_market_value || 0;
      solatium += f.solatium || 0;
      rehabilitation += f.rehabilitation_cost || 0;
      admin += f.admin_cost || 0;
      totalPaid += f.paid_amount || 0;
    });

    let totalAreaNotified = 0, totalAreaAcquired = 0;
    let totalAffectedFamilies = 0, totalDisplacedFamilies = 0;

    parcels.forEach(p => {
      totalAreaNotified += p.area_notified || 0;
      totalAreaAcquired += p.area_acquired || 0;
      totalAffectedFamilies += p.affected_families || 0;
      totalDisplacedFamilies += p.displaced_families || 0;
    });

    // Stage & State distribution
    const stageDistribution = {
      'preliminary-survey': 0,
      'notification': 0,
      'survey-objections': 0,
      'declaration': 0,
      'negotiation': 0,
      'compensation': 0,
      'possession-transfer': 0
    };
    const stateDistribution = {};

    parcels.forEach(p => {
      if (stageDistribution[p.current_stage] !== undefined) stageDistribution[p.current_stage]++;
      stateDistribution[p.state] = (stateDistribution[p.state] || 0) + 1;
    });

    res.json({
      totalParcels,
      inProgress,
      completed,
      totalCompensation: Number((totalComp / 100).toFixed(2)), // Crores
      avgProcessingDays: 142,
      pendingApprovals: 12,
      overdueCases,
      budgetUtilization: totalComp > 0 ? Math.round((totalPaid / totalComp) * 100) : 68,
      totalAreaNotified: Number(totalAreaNotified.toFixed(1)),
      totalAreaAcquired: Number(totalAreaAcquired.toFixed(1)),
      totalAffectedFamilies,
      totalDisplacedFamilies,
      monthlyProgress: [
        { month: 'Oct 2023', count: 2 }, { month: 'Nov 2023', count: 5 }, { month: 'Dec 2023', count: 8 },
        { month: 'Jan 2024', count: 15 }, { month: 'Feb 2024', count: 20 }, { month: 'Mar 2024', count: 28 },
        { month: 'Apr 2024', count: 32 }, { month: 'May 2024', count: 38 }, { month: 'Jun 2024', count: 42 },
        { month: 'Jul 2024', count: 45 }, { month: 'Aug 2024', count: 48 }, { month: 'Sep 2024', count: 50 }
      ],
      stageDistribution,
      stateDistribution,
      compensationBreakdown: {
        landCost: Number((landCost / 100).toFixed(2)),
        solatium: Number((solatium / 100).toFixed(2)),
        rehabilitation: Number((rehabilitation / 100).toFixed(2)),
        admin: Number((admin / 100).toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/activity-log
router.get('/activity-log', async (req, res) => {
  try {
    const db = await getDb();
    const rows = toObjects(db.exec(`SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 30`));
    res.json(rows.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      timestamp: a.timestamp,
      userId: a.user_id,
      parcelId: a.parcel_id
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
