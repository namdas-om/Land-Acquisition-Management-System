window.AppData = (function() {
  const states = [
    { state: 'Maharashtra', districts: ['Pune', 'Thane', 'Raigad'], baseCoords: { lat: 18.5, lng: 73.8 } },
    { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur'], baseCoords: { lat: 26.9, lng: 75.8 } },
    { state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai'], baseCoords: { lat: 13.0, lng: 80.2 } },
    { state: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Agra'], baseCoords: { lat: 26.8, lng: 80.9 } },
    { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara'], baseCoords: { lat: 23.0, lng: 72.6 } }
  ];

  const authorities = ['NHAI', 'State PWD', 'Smart City Mission', 'Railway Board', 'Industrial Development Corp'];
  const purposes = ['National Highway Expansion', 'Metro Rail Corridor', 'Industrial Zone', 'Smart City Project', 'Railway Expansion', 'Irrigation Canal'];
  const stages = ['preliminary-survey', 'notification', 'survey-objections', 'declaration', 'negotiation', 'compensation', 'possession-transfer'];
  const statuses = ['on-track', 'delayed', 'completed', 'on-hold', 'disputed'];
  const landTypes = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Barren', 'Forest'];

  // Indian Names
  const firstNames = ['Aarav', 'Rahul', 'Mohammed', 'Arjun', 'Suresh', 'Vikram', 'Priya', 'Anjali', 'Fatima', 'Sneha', 'Rajesh', 'Amit', 'Ibrahim', 'Harpreet', 'Ravi', 'Ganesh', 'Kavita', 'Neha', 'Pooja', 'Sunil'];
  const lastNames = ['Sharma', 'Patil', 'Khan', 'Singh', 'Deshmukh', 'Iyer', 'Reddy', 'Das', 'Kumar', 'Gupta', 'Jain', 'Mehta', 'Nair', 'Ali', 'Yadav'];

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const getRandomNum = (min, max, decimals = 0) => {
    const val = Math.random() * (max - min) + min;
    return Number(val.toFixed(decimals));
  };
  const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  // Owners
  const owners = [];
  for (let i = 1; i <= 30; i++) {
    const fName = getRandomItem(firstNames);
    const lName = getRandomItem(lastNames);
    owners.push({
      id: `OWN-${i.toString().padStart(3, '0')}`,
      name: `${fName} ${lName}`,
      fatherName: `${getRandomItem(firstNames)} ${lName}`,
      aadhaar: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `${fName.toLowerCase()}${i}@gmail.com`,
      address: `House No ${getRandomNum(1, 100)}, Ward ${getRandomNum(1, 20)}, ${getRandomItem(['Main Market', 'Station Road', 'Gandhi Nagar', 'Shivaji Nagar'])}`,
      parcels: [],
      bankAccount: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      compensationStatus: 'pending',
      totalCompensation: 0,
      paidAmount: 0
    });
  }

  // Stage distribution constraints
  let stageCounts = { 'preliminary-survey': 3, 'notification': 5, 'survey-objections': 8, 'declaration': 7, 'negotiation': 10, 'compensation': 8, 'possession-transfer': 9 };
  let availableStages = [];
  Object.keys(stageCounts).forEach(stage => {
    for (let i = 0; i < stageCounts[stage]; i++) availableStages.push(stage);
  });
  
  // Parcels & Finances
  const parcels = [];
  const finances = [];
  const totalStats = {
    totalCompensation: 0,
    inProgress: 0,
    completed: 0,
    overdueCases: 0,
    totalAreaNotified: 0,
    totalAreaAcquired: 0,
    totalAffectedFamilies: 0,
    totalDisplacedFamilies: 0,
    compensationBreakdown: { landCost: 0, solatium: 0, rehabilitation: 0, admin: 0 }
  };

  for (let i = 1; i <= 50; i++) {
    const stateObj = states[i % states.length];
    const stage = availableStages[i - 1];
    const isCompleted = stage === 'possession-transfer';
    let status = isCompleted ? 'completed' : getRandomItem(['on-track', 'on-track', 'delayed', 'disputed', 'on-hold']);
    
    if (status === 'delayed') totalStats.overdueCases++;
    if (isCompleted) totalStats.completed++;
    else totalStats.inProgress++;

    const owner = getRandomItem(owners);
    const parcelId = `PCL-2024-${i.toString().padStart(4, '0')}`;
    owner.parcels.push(parcelId);

    const isRural = Math.random() > 0.4;
    const landType = getRandomItem(landTypes);
    const marketValue = getRandomNum(10, 150, 2); // In Lakhs

    const area = getRandomNum(0.5, 50, 2);
    const areaNotified = Number((area * 1.15).toFixed(2));
    const areaAcquired = isCompleted ? area : Number((area * getRandomNum(0.3, 0.85, 2)).toFixed(2));
    const affectedFamilies = getRandomNum(2, 25);
    const displacedFamilies = Math.floor(affectedFamilies * getRandomNum(0.2, 0.6, 2));

    totalStats.totalAreaNotified += areaNotified;
    totalStats.totalAreaAcquired += areaAcquired;
    totalStats.totalAffectedFamilies += affectedFamilies;
    totalStats.totalDisplacedFamilies += displacedFamilies;

    const sec11Date = '2024-01-15';
    const sec19Date = stage !== 'preliminary-survey' && stage !== 'notification' ? '2024-03-20' : null;
    const sec21Date = stage === 'compensation' || stage === 'possession-transfer' ? '2024-05-10' : null;
    const rrStatus = isCompleted ? 'Completed' : (stage === 'compensation' ? 'In-Progress' : 'Pending Verification');
    const possessionStatus = isCompleted ? 'Transferred to Agency' : (stage === 'compensation' ? 'Pending Handover' : 'Under Acquisition');

    parcels.push({
      id: parcelId,
      surveyNo: `${getRandomNum(1, 200)}/${getRandomItem(['A', 'B', 'C', '1A', '2B'])}`,
      village: `Village-${getRandomNum(100, 999)}`,
      tehsil: `Tehsil-${getRandomNum(10, 99)}`,
      district: getRandomItem(stateObj.districts),
      state: stateObj.state,
      area: area,
      areaNotified: areaNotified,
      areaAcquired: areaAcquired,
      affectedFamilies: affectedFamilies,
      displacedFamilies: displacedFamilies,
      rrStatus: rrStatus,
      possessionStatus: possessionStatus,
      section11Date: sec11Date,
      section19Date: sec19Date,
      section21Date: sec21Date,
      landType: landType,
      ownerId: owner.id,
      currentStage: stage,
      status: status,
      marketValue: marketValue,
      acquiringAuthority: getRandomItem(authorities),
      purpose: getRandomItem(purposes),
      priority: getRandomItem(['high', 'medium', 'low']),
      startDate: getRandomDate(new Date('2024-01-01'), new Date('2024-06-30')).toISOString(),
      expectedCompletion: getRandomDate(new Date('2024-12-01'), new Date('2025-12-31')).toISOString(),
      coordinates: {
        lat: stateObj.baseCoords.lat + (Math.random() - 0.5) * 0.2,
        lng: stateObj.baseCoords.lng + (Math.random() - 0.5) * 0.2
      },
      history: [
        { date: '2024-01-15', event: 'Section 11 Preliminary Notification Issued', stage: 'preliminary-survey', officer: 'OFF-001' }
      ],
      documents: [`DOC-${getRandomNum(1, 35).toString().padStart(3, '0')}`],
      notes: 'Standard processing protocol initiated under LARR Act 2013.'
    });

    // Finances logic
    const solatium = marketValue; // 100% solatium
    const additionalCompensation = isRural ? marketValue : 0;
    const rehabilitationCost = getRandomNum(2, 10, 2);
    const adminCost = Number((marketValue * 0.05).toFixed(2));
    const totalAward = Number((marketValue + solatium + additionalCompensation + rehabilitationCost + adminCost).toFixed(2));
    
    let paymentStatus = 'not-started';
    let paidAmount = 0;
    
    if (stage === 'possession-transfer' || stage === 'compensation') {
      paymentStatus = stage === 'possession-transfer' ? 'completed' : 'in-progress';
      paidAmount = stage === 'possession-transfer' ? totalAward : Number((totalAward * 0.5).toFixed(2));
    }
    
    owner.totalCompensation += totalAward;
    owner.paidAmount += paidAmount;
    if (paymentStatus === 'completed') owner.compensationStatus = 'completed';
    else if (paymentStatus === 'in-progress') owner.compensationStatus = 'partial';
    
    totalStats.totalCompensation += totalAward;
    totalStats.compensationBreakdown.landCost += marketValue;
    totalStats.compensationBreakdown.solatium += solatium;
    totalStats.compensationBreakdown.rehabilitation += rehabilitationCost;
    totalStats.compensationBreakdown.admin += adminCost;

    finances.push({
      parcelId: parcelId,
      landMarketValue: marketValue,
      solatium: solatium,
      additionalCompensation: additionalCompensation,
      rehabilitationCost: rehabilitationCost,
      adminCost: adminCost,
      totalAward: totalAward,
      paymentStatus: paymentStatus,
      paidAmount: paidAmount,
      paymentDate: paymentStatus !== 'not-started' ? new Date().toISOString() : null,
      paymentMethod: paymentStatus !== 'not-started' ? 'RTGS / DBT' : null
    });
  }

  // Officers
  const officers = [];
  const designations = ['District Collector', 'Sub-Divisional Magistrate', 'Revenue Officer', 'Land Acquisition Officer', 'Tehsildar'];
  for (let i = 1; i <= 15; i++) {
    officers.push({
      id: `OFF-${i.toString().padStart(3, '0')}`,
      name: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
      designation: getRandomItem(designations),
      department: 'Revenue & Land Resources (DoLR)',
      jurisdiction: `${states[i % states.length].state}`,
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `officer${i}@gov.in`,
      activeCases: getRandomNum(2, 10),
      completedCases: getRandomNum(5, 30)
    });
  }

  // Legal Teams
  const legalTeams = [];
  for (let i = 1; i <= 5; i++) {
    legalTeams.push({
      id: `LEG-${i.toString().padStart(3, '0')}`,
      firmName: `${getRandomItem(lastNames)} & Associates`,
      advocate: `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`,
      specialization: getRandomItem(['Land Acquisition', 'Revenue Law', 'Rehabilitation & Resettlement']),
      phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
      email: `legal${i}@lawfirm.in`,
      casesAssigned: getRandomNum(1, 10),
      upcomingHearings: [
        { date: new Date().toISOString(), court: 'High Court', caseRef: `HC-${getRandomNum(1000, 9999)}`, parcelId: parcels[getRandomNum(0, 49)].id }
      ]
    });
  }

  // Documents
  const documents = [];
  const docTypes = ['SIA Report', 'Section 11 Notification', 'Section 19 Declaration', 'Section 21 Notice', 'Award Letter', 'Compensation Agreement', 'Title Deed', 'Possession Certificate', 'R&R Compliance Order'];
  for (let i = 1; i <= 35; i++) {
    documents.push({
      id: `DOC-${i.toString().padStart(3, '0')}`,
      name: `${getRandomItem(docTypes)} - Case ${i}`,
      type: getRandomItem(docTypes),
      parcelId: parcels[getRandomNum(0, 49)].id,
      uploadDate: getRandomDate(new Date('2024-01-01'), new Date()).toISOString(),
      status: getRandomItem(['Draft', 'Under Review', 'Verified & Signed', 'Archived']),
      fileSize: `${getRandomNum(1, 10, 1)} MB`,
      uploadedBy: officers[getRandomNum(0, 14)].name,
      description: 'Official document associated with land acquisition statutory phase under LARR Act 2013.'
    });
  }

  // Notifications
  const notifications = [];
  for (let i = 1; i <= 20; i++) {
    notifications.push({
      id: `NTF-${i.toString().padStart(3, '0')}`,
      type: getRandomItem(['deadline', 'approval', 'payment', 'hearing', 'system']),
      title: 'Statutory SLA Alert: LARR Review',
      description: 'Section 19 declaration verification pending for designated parcel.',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: Math.random() > 0.6,
      priority: getRandomItem(['high', 'medium', 'low']),
      relatedParcelId: parcels[getRandomNum(0, 49)].id,
      actionLabel: 'View Parcel',
      actionTarget: 'parcels'
    });
  }

  // Activity Log
  const activityLog = [];
  for (let i = 1; i <= 30; i++) {
    activityLog.push({
      id: i,
      type: getRandomItem(['parcel-added', 'stage-change', 'payment', 'document-upload', 'approval', 'note-added']),
      title: 'Workflow Milestone Achieved',
      description: 'The parcel has successfully transitioned to the next statutory LARR 2013 stage.',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      userId: officers[getRandomNum(0, 14)].id,
      parcelId: parcels[getRandomNum(0, 49)].id
    });
  }

  // Compute final dashboard stats
  const stageDistribution = {};
  stages.forEach(s => stageDistribution[s] = 0);
  parcels.forEach(p => stageDistribution[p.currentStage]++);

  const stateDistribution = {};
  states.forEach(s => stateDistribution[s.state] = 0);
  parcels.forEach(p => stateDistribution[p.state]++);

  return {
    parcels,
    owners,
    officers,
    legalTeams,
    documents,
    finances,
    notifications,
    activityLog,
    stats: {
      totalParcels: 50,
      inProgress: totalStats.inProgress,
      completed: totalStats.completed,
      totalCompensation: Number((totalStats.totalCompensation / 100).toFixed(2)), // In Crores
      avgProcessingDays: 142,
      pendingApprovals: 12,
      overdueCases: totalStats.overdueCases,
      budgetUtilization: 68,
      totalAreaNotified: Number(totalStats.totalAreaNotified.toFixed(1)),
      totalAreaAcquired: Number(totalStats.totalAreaAcquired.toFixed(1)),
      totalAffectedFamilies: totalStats.totalAffectedFamilies,
      totalDisplacedFamilies: totalStats.totalDisplacedFamilies,
      monthlyProgress: [
        { month: 'Oct 2023', count: 2 }, { month: 'Nov 2023', count: 5 }, { month: 'Dec 2023', count: 8 },
        { month: 'Jan 2024', count: 15 }, { month: 'Feb 2024', count: 20 }, { month: 'Mar 2024', count: 28 },
        { month: 'Apr 2024', count: 32 }, { month: 'May 2024', count: 38 }, { month: 'Jun 2024', count: 42 },
        { month: 'Jul 2024', count: 45 }, { month: 'Aug 2024', count: 48 }, { month: 'Sep 2024', count: 50 }
      ],
      stageDistribution,
      stateDistribution,
      compensationBreakdown: {
        landCost: Number((totalStats.compensationBreakdown.landCost / 100).toFixed(2)),
        solatium: Number((totalStats.compensationBreakdown.solatium / 100).toFixed(2)),
        rehabilitation: Number((totalStats.compensationBreakdown.rehabilitation / 100).toFixed(2)),
        admin: Number((totalStats.compensationBreakdown.admin / 100).toFixed(2))
      }
    }
  };
})();
