// ============================================================
// data.js — All static/seed data for LC CSK Planner
// ============================================================

// ── MEMBERS (Lion ID → name + role) ──────────────────────────
const MEMBERS_SEED = [
  { lion_id:'27236237', name:'Aadhil Ahamed H',    role:'Club Membership Chairperson', is_admin:false },
  { lion_id:'26854778', name:'Sandhya B',           role:'Club Director',               is_admin:false },
  { lion_id:'4814277',  name:'Jayachandaran B',     role:'Member',                      is_admin:false },
  { lion_id:'27238834', name:'Dinesh Babu',         role:'Member',                      is_admin:false },
  { lion_id:'27238846', name:'Keerthana D',         role:'Member',                      is_admin:false },
  { lion_id:'5571921',  name:'Keerthi Dakki',       role:'Club Administrator',          is_admin:false },
  { lion_id:'26854752', name:'Selva Emi M',         role:'Club Marketing Chairperson',  is_admin:false },
  { lion_id:'26853522', name:'Darshika J',          role:'Club Service Chairperson',    is_admin:false },
  { lion_id:'27238840', name:'Vasanth Kumar',       role:'Member',                      is_admin:false },
  { lion_id:'27236200', name:'Sanjai Kumar M',      role:'Club Second Vice President',  is_admin:false },
  { lion_id:'27236255', name:'Aarthi M',            role:'Member',                      is_admin:false },
  { lion_id:'5194051',  name:'Shankar Kumar M',     role:'Club Secretary',              is_admin:true  },
  { lion_id:'26853519', name:'Aashaya Philip',      role:'Club Treasurer',              is_admin:false },
  { lion_id:'27238819', name:'Hari Prasath',        role:'Club Director',               is_admin:false },
  { lion_id:'27238830', name:'Ragavi R',            role:'Club First Vice President',   is_admin:false },
  { lion_id:'26791087', name:'Parthasarathy R',     role:'Club LCIF Coordinator',       is_admin:false },
  { lion_id:'27236306', name:'Santhos Ragu',        role:'Member',                      is_admin:false },
  { lion_id:'27238843', name:'Sakthi S',            role:'Member',                      is_admin:false },
  { lion_id:'5571857',  name:'Saravanakumar T',     role:'Member',                      is_admin:false },
  { lion_id:'27238832', name:'K.V Udhaya Raj',      role:'Club President',              is_admin:false },
];

// ── PLANNING PHASES ──────────────────────────────────────────
const DEFAULT_PHASES = [
  {
    id:'ph1', order:1, label:'Phase 1 — Foundation (6+ weeks before)', cls:'ph-0',
    tasks:[
      {id:'t1_1',order:1,t:'Apply for club PAN card',note:'Required for bank account and all official transactions',who:'President + Secretary',p:'urgent',done:false,deadline:''},
      {id:'t1_2',order:2,t:'Prepare rubber stamp',note:'Club name, number, district — needed for banking and documents',who:'Secretary',p:'urgent',done:false,deadline:''},
      {id:'t1_3',order:3,t:'Open Karur Vysya Bank account',note:'Bring: PAN card, rubber stamp, bylaws, 2 officer signatures',who:'President + Treasurer',p:'urgent',done:false,deadline:''},
      {id:'t1_4',order:4,t:'Print and bind the Constitution & By-Laws',note:'Minimum 5 copies — Board, Secretary, display',who:'Secretary',p:'urgent',done:false,deadline:''},
      {id:'t1_5',order:5,t:'Confirm Installation Officer',note:'Request PDG Mahesh or PDG Sampath well in advance',who:'President',p:'urgent',done:false,deadline:''},
      {id:'t1_6',order:6,t:'Notify District Governor and obtain approval',note:'Send formal letter with event date and venue',who:'President + Secretary',p:'urgent',done:false,deadline:''},
      {id:'t1_7',order:7,t:'Elect/confirm all club officers and chairpersons',note:'Ensure GAT team is finalised',who:'Board',p:'urgent',done:false,deadline:''},
      {id:'t1_8',order:8,t:'Set Installation event date',note:'Align with DG calendar and venue availability',who:'President',p:'urgent',done:false,deadline:''},
    ]
  },
  {
    id:'ph2', order:2, label:'Phase 2 — Branding & Merchandise (4–5 weeks)', cls:'ph-1',
    tasks:[
      {id:'t2_1',order:1,t:'Finalise T-shirt design',note:'Check screen print and embroidery options',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t2_2',order:2,t:'Collect T-shirt sizes from all members',note:'Use WhatsApp form or Google Form',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t2_3',order:3,t:'Place T-shirt order with vendor',note:'1 per person — include installation officer and guests',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t2_4',order:4,t:'Design club letter pad layout',note:'LCI logo, club name, number, address, officer names',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t2_5',order:5,t:'Print letter pads (50–100 copies)',note:'',who:'Secretary',p:'med',done:false,deadline:''},
      {id:'t2_6',order:6,t:'Procure Gong and Gavel',note:'Available from Lions supply or brass market',who:'Lion Tamer',p:'med',done:false,deadline:''},
      {id:'t2_7',order:7,t:'Purchase ties for PST installation ceremony',note:'Confirm protocol colour with district',who:'President',p:'med',done:false,deadline:''},
      {id:'t2_8',order:8,t:'Design and print club ID cards',note:'For all 20 members',who:'Secretary',p:'med',done:false,deadline:''},
    ]
  },
  {
    id:'ph3', order:3, label:'Phase 3 — Event Logistics (3–4 weeks)', cls:'ph-2',
    tasks:[
      {id:'t3_1',order:1,t:'Book and confirm venue',note:'Confirm capacity, AV, stage, seating, parking',who:'Program Coordinator',p:'urgent',done:false,deadline:''},
      {id:'t3_2',order:2,t:'Check venue quality at Sabari',note:'Banquet setup, PA system, projector screen',who:'Program Coordinator',p:'urgent',done:false,deadline:''},
      {id:'t3_3',order:3,t:'Prepare guest list',note:'DG, District Officers, PDGs, sponsors, families, media',who:'Secretary + President',p:'high',done:false,deadline:''},
      {id:'t3_4',order:4,t:'Send formal invitation letters to PDGs and DG',note:'At least 3 weeks before — include protocol briefing',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t3_5',order:5,t:'Send digital invites to members and families',note:'',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t3_6',order:6,t:'Design installation banner and flex board',note:'All officer names, LCI logo, district logo',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t3_7',order:7,t:'Print banners, standees, and stage backdrop',note:'',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t3_8',order:8,t:'Plan stage layout and seating arrangement',note:'Protocol seating for PDGs, DG, installation officer',who:'Lion Tamer',p:'med',done:false,deadline:''},
      {id:'t3_9',order:9,t:'Arrange garlands and bouquets for dignitaries',note:'',who:'Program Coordinator',p:'med',done:false,deadline:''},
      {id:'t3_10',order:10,t:'Arrange mementos for PDGs and special guests',note:'',who:'President',p:'med',done:false,deadline:''},
      {id:'t3_11',order:11,t:'Finalise caterer and refreshment plan',note:'Tea, snacks, or dinner depending on event time',who:'Program Coordinator',p:'med',done:false,deadline:''},
      {id:'t3_12',order:12,t:'Arrange photographer and videographer',note:'Official installation must be documented',who:'Marketing Chair',p:'high',done:false,deadline:''},
    ]
  },
  {
    id:'ph4', order:4, label:'Phase 4 — Content & Presentations (2–3 weeks)', cls:'ph-3',
    tasks:[
      {id:'t4_1',order:1,t:'Prepare Calendar of Events presentation',note:'Monthly service plan for the year',who:'Service Chair',p:'high',done:false,deadline:''},
      {id:'t4_2',order:2,t:'Finalise Welcome Kit contents',note:'Bylaws, ID card, membership card, Lions badge, welcome letter',who:'Secretary + Membership Chair',p:'high',done:false,deadline:''},
      {id:'t4_3',order:3,t:'Prepare video presentation for member introductions',note:'Another member introduces each officer',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t4_4',order:4,t:'Prepare officer installation speeches',note:'Each installed officer to give a 2-min maiden speech',who:'President-elect',p:'high',done:false,deadline:''},
      {id:'t4_5',order:5,t:'Brief the MC on agenda flow',note:'Rehearse stage cues, introduction scripts, mic handover',who:'Program Coordinator',p:'high',done:false,deadline:''},
      {id:'t4_6',order:6,t:'Identify Project of the Day',note:'Blood donation drive or food distribution preferred',who:'Service Chair',p:'high',done:false,deadline:''},
      {id:'t4_7',order:7,t:'Prepare DG thrust area alignment presentation',note:'Hunger and Healthcare focus — show year plan alignment',who:'Service Chair',p:'med',done:false,deadline:''},
      {id:'t4_8',order:8,t:'Draft Vote of Thanks speech',note:'',who:'Designated member',p:'med',done:false,deadline:''},
      {id:'t4_9',order:9,t:'Prepare social media content plan for event day',note:'Instagram reels, posts, stories — plan hashtags and timing',who:'Marketing Chair',p:'med',done:false,deadline:''},
    ]
  },
  {
    id:'ph5', order:5, label:'Phase 5 — Final Week & Event Day', cls:'ph-4',
    tasks:[
      {id:'t5_1',order:1,t:'Confirm attendance of all PDGs and Installation Officer',note:'Call each PDG personally 3 days before',who:'President + Secretary',p:'urgent',done:false,deadline:''},
      {id:'t5_2',order:2,t:'Conduct dry run of stage proceedings',note:'Walk through full agenda with MC and all officers',who:'Program Coordinator',p:'urgent',done:false,deadline:''},
      {id:'t5_3',order:3,t:'Collect and pack all welcome kits',note:'',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t5_4',order:4,t:'Collect T-shirts and label by name',note:'',who:'Lion Tamer',p:'high',done:false,deadline:''},
      {id:'t5_5',order:5,t:'Ensure gong, gavel, Lions flag, National flag at venue',note:'',who:'Lion Tamer',p:'urgent',done:false,deadline:''},
      {id:'t5_6',order:6,t:'Carry printed agenda copies for all dignitaries',note:'',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t5_7',order:7,t:'Set up stage and seating 2 hours before event',note:'',who:'Lion Tamer + Team',p:'urgent',done:false,deadline:''},
      {id:'t5_8',order:8,t:'Test all AV equipment — mic, projector, laptop',note:'',who:'Program Coordinator',p:'urgent',done:false,deadline:''},
      {id:'t5_9',order:9,t:'Receive and seat PDGs and special guests',note:'Assign a Lion to each PDG as escort',who:'Lion Tamer',p:'urgent',done:false,deadline:''},
      {id:'t5_10',order:10,t:'T-shirt release ceremony — distribute to members',note:'',who:'Marketing Chair + President',p:'high',done:false,deadline:''},
      {id:'t5_11',order:11,t:'Conduct installation ceremony per agenda',note:'',who:'All Officers + Installation Officer',p:'urgent',done:false,deadline:''},
      {id:'t5_12',order:12,t:'Capture photos and videos throughout event',note:'',who:'Photographer',p:'high',done:false,deadline:''},
    ]
  },
  {
    id:'ph6', order:6, label:'Phase 6 — Post-Installation (within 1 week)', cls:'ph-5',
    tasks:[
      {id:'t6_1',order:1,t:'Report new officers to LCI International Office',note:'Secretary must submit within 15 days of election',who:'Secretary',p:'urgent',done:false,deadline:''},
      {id:'t6_2',order:2,t:'Submit event photos and report to District Governor',note:'',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t6_3',order:3,t:'Post event highlights on social media',note:'',who:'Marketing Chair',p:'high',done:false,deadline:''},
      {id:'t6_4',order:4,t:'Issue Thank You letters to all PDGs and guests',note:'',who:'President + Secretary',p:'high',done:false,deadline:''},
      {id:'t6_5',order:5,t:'File all financial receipts and update budget tracker',note:'',who:'Treasurer',p:'high',done:false,deadline:''},
      {id:'t6_6',order:6,t:'Officially open club bank account if not done',note:'',who:'President + Treasurer',p:'urgent',done:false,deadline:''},
      {id:'t6_7',order:7,t:'Conduct first formal Board of Directors meeting',note:'Set meeting schedule, committees, year plan approval',who:'President',p:'high',done:false,deadline:''},
      {id:'t6_8',order:8,t:'Activate club on MyLCI portal',note:'Register members, update officer list',who:'Secretary',p:'high',done:false,deadline:''},
      {id:'t6_9',order:9,t:'Tie up with Uravugal Trust for community project',note:'',who:'Service Chair',p:'med',done:false,deadline:''},
      {id:'t6_10',order:10,t:'Schedule first service project',note:'Blood donation or food drive',who:'Service Chair',p:'med',done:false,deadline:''},
    ]
  },
];

// ── AGENDA ITEMS ─────────────────────────────────────────────
const DEFAULT_AGENDA = [
  {id:'ag1', order:1, title:'Meeting called to order', detail:'By the Presiding Officer / Host Club President', time:'5:00 PM', duration:2, type:'protocol'},
  {id:'ag2', order:2, title:'Lions Prayer', detail:'All rise — led by a senior Lion', time:'5:02 PM', duration:2, type:'protocol'},
  {id:'ag3', order:3, title:'Leo Pledge', detail:'Led by the Leo Club installation officer', time:'5:04 PM', duration:1, type:'protocol'},
  {id:'ag4', order:4, title:'National Flag Salutation & National Anthem', detail:'All stand at attention — display National Flag on stage', time:'5:05 PM', duration:3, type:'protocol'},
  {id:'ag5', order:5, title:'Welcome Address', detail:'By Host Club President — welcome PDGs, DG, dignitaries and guests', time:'5:08 PM', duration:5, type:'speech'},
  {id:'ag6', order:6, title:'Charter Night Celebration', detail:'Special address by senior PDG — significance of chartering LC CSK', time:'5:13 PM', duration:8, type:'ceremony'},
  {id:'ag7', order:7, title:'Introduction of Induction Officer', detail:'MC introduces the PDG conducting member induction', time:'5:21 PM', duration:2, type:'protocol'},
  {id:'ag8', order:8, title:'Induction Ceremony — New Members', detail:'PDG formally inducts all founding members. Members take the Lions Pledge.', time:'5:23 PM', duration:12, type:'ceremony'},
  {id:'ag9', order:9, title:'T-Shirt Release & Welcome Kit Distribution', detail:'President releases club T-shirts to members — CSK innovation moment!', time:'5:35 PM', duration:5, type:'ceremony'},
  {id:'ag10', order:10, title:'Introduction of Lions Installation Officer', detail:'MC formally introduces the Installation Officer', time:'5:40 PM', duration:2, type:'protocol'},
  {id:'ag11', order:11, title:'Installation of Lion Officers', detail:'PDG installs all officers including all Chairpersons', time:'5:42 PM', duration:20, type:'ceremony'},
  {id:'ag12', order:12, title:'Maiden Speeches by Installed Officers', detail:'President + key officers — 2 minutes each. Max 4–5 speakers.', time:'6:02 PM', duration:12, type:'speech'},
  {id:'ag13', order:13, title:'Calendar of Events Presentation', detail:'Service Chair presents year plan — projects, drives, DG thrust areas', time:'6:14 PM', duration:5, type:'service'},
  {id:'ag14', order:14, title:'Project of the Day Announcement', detail:'Blood donation drive or food distribution — first service project launched', time:'6:19 PM', duration:5, type:'service'},
  {id:'ag15', order:15, title:'Vision & Eye Donation Pledge', detail:'All members take eye donation pledge — officer reads declaration', time:'6:24 PM', duration:3, type:'service'},
  {id:'ag16', order:16, title:'Honouring of PDGs and Special Guests', detail:'Present mementos and shawls to each PDG and DG', time:'6:27 PM', duration:10, type:'felicitation'},
  {id:'ag17', order:17, title:'Felicitation by District Officers', detail:'District Zone Chairperson / Region Chairperson address', time:'6:37 PM', duration:5, type:'felicitation'},
  {id:'ag18', order:18, title:'Felicitation by Senior PDG', detail:"Senior PDG's blessing and message for LC CSK", time:'6:42 PM', duration:5, type:'felicitation'},
  {id:'ag19', order:19, title:'Vote of Thanks', detail:'Thank Installation Officer, PDGs, DG, host club, sponsors, members and families', time:'6:47 PM', duration:4, type:'speech'},
  {id:'ag20', order:20, title:'Lions Toast & Closing', detail:'Traditional Lions toast. Meeting formally closed by newly installed President.', time:'6:51 PM', duration:3, type:'protocol'},
];

// ── CHAIRPERSONS ─────────────────────────────────────────────
const DEFAULT_CHAIRS = [
  {id:'ch1',order:1,name:'Health & Wellness Chairperson',lci:'LCI Global Cause: Diabetes · DG Thrust: Healthcare',icon:'🏥',bg:'#E0F2EE',iconBg:'#0D7C6B',projects:['Medical Camp','Blood Donation','Eye Camp','Diabetes Awareness','Dental Camp'],chipColor:'#0D7C6B',chipBg:'#E0F2EE',duties:'Organise 4+ health camps per year. Coordinate with hospitals and NGOs. Report beneficiary count to LCI. Champion vision screening and blood donation drives. Link to LCIF grant applications.',assigned_to:'',assigned_by:''},
  {id:'ch2',order:2,name:'Hunger & Food Security Chairperson',lci:'LCI Global Cause: Hunger · DG Thrust: Hunger Relief',icon:'🍚',bg:'#FEF3DC',iconBg:'#9C6A0A',projects:['Food Distribution','Annadhanam','Ration Kit Drive','Mid-Day Meal','Uravugal Trust'],chipColor:'#9C6A0A',chipBg:'#FEF3DC',duties:'Plan monthly food distribution drives. Coordinate Annadhanam during festivals. Partner with Uravugal Trust and other NGOs. Track number of meals served.',assigned_to:'',assigned_by:''},
  {id:'ch3',order:3,name:'Environment Chairperson',lci:'LCI Global Cause: Environment · Specialty: E-Waste',icon:'🌿',bg:'#E8F5EC',iconBg:'#2A6B3A',projects:['Tree Plantation','Beach Cleaning','Community Clean-Up','Plastic-Free Drive','E-Waste Drive'],chipColor:'#2A6B3A',chipBg:'#E8F5EC',duties:'Lead 2 environmental activities per quarter. Coordinate tree plantation with Chennai Corporation. Organise coastal and community clean-up drives. Lead E-Waste collection drives (club specialty).',assigned_to:'',assigned_by:''},
  {id:'ch4',order:4,name:'Vision Chairperson',lci:"LCI Global Cause: Vision (Lions' founding cause)",icon:'👁️',bg:'#F0EAFA',iconBg:'#5A3A8A',projects:['Eye Camp','Vision Screening','Spectacle Donation','Eye Donation Pledge','Cataract Surgery'],chipColor:'#5A3A8A',chipBg:'#F0EAFA',duties:'Organise 2+ eye camps per year. Register members as eye donors. Coordinate with Rotary Eye Banks. Raise funds for cataract surgeries. Submit data to LCI SightFirst programme.',assigned_to:'',assigned_by:''},
  {id:'ch5',order:5,name:'Youth & Leo Chairperson',lci:'LCI Programme: Leo Clubs · Youth Camps',icon:'🎓',bg:'#E8F0FF',iconBg:'#1A2F5A',projects:['Leo Club Formation','Youth Leadership','School Awareness','Scholarship Drive'],chipColor:'#1A2F5A',chipBg:'#E8F0FF',duties:'Initiate process to form a Leo Club. Organise youth leadership programmes. Identify student talent for scholarships. Run career guidance workshops.',assigned_to:'',assigned_by:''},
  {id:'ch6',order:6,name:'Childhood Cancer & Disability Chairperson',lci:'LCI Global Cause: Childhood Cancer',icon:'🎗️',bg:'#FDECEA',iconBg:'#B83A2A',projects:['Cancer Awareness','CANKIDS Support','Wheelchair Donation','Assistive Devices'],chipColor:'#B83A2A',chipBg:'#FDECEA',duties:'Organise childhood cancer awareness drives. Coordinate with hospitals for paediatric cancer patients. Collect and distribute wheelchairs. Apply for LCIF Childhood Cancer grants.',assigned_to:'',assigned_by:''},
  {id:'ch7',order:7,name:'Women Empowerment Chairperson',lci:'LCI Programme: Women Initiatives',icon:'💜',bg:'#F5E6FF',iconBg:'#6A3A9A',projects:['Skill Training','Self-Help Groups','Hygiene Awareness','Women Safety'],chipColor:'#6A3A9A',chipBg:'#F5E6FF',duties:'Plan skill development programmes for women. Coordinate hygiene and health awareness. Partner with Self-Help Groups. Organise women safety awareness sessions.',assigned_to:'',assigned_by:''},
  {id:'ch8',order:8,name:'Disaster Relief & Humanitarian Chairperson',lci:'LCI Global Cause: Humanitarian · LCIF Disaster Relief',icon:'🤝',bg:'#FEF3DC',iconBg:'#854F0B',projects:['Flood Relief','Emergency Kits','LCIF Grant','Aid Coordination'],chipColor:'#854F0B',chipBg:'#FEF3DC',duties:'Maintain emergency response roster. Coordinate relief during floods and disasters. Apply for LCIF Disaster Relief grants. Liaise with district DRT.',assigned_to:'',assigned_by:''},
];

// ── BUDGET ───────────────────────────────────────────────────
const DEFAULT_BUDGET = [
  {id:'b1', item:'Venue booking',                    cat:'Event',         est:25000, actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b2', item:'Stage & decoration',               cat:'Event',         est:15000, actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b3', item:'Catering / refreshments',          cat:'Event',         est:20000, actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b4', item:'Photographer & videographer',      cat:'Event',         est:8000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b5', item:'Banner, flex, standee printing',   cat:'Branding',      est:6000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b6', item:'T-shirts (20 members × ₹500)',     cat:'Merchandise',   est:10000, actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b7', item:'Letter pad printing',              cat:'Branding',      est:2000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b8', item:'Rubber stamp',                     cat:'Admin',         est:500,   actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b9', item:'Gong and Gavel',                   cat:'Equipment',     est:3000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b10',item:'Ties for PST installation',        cat:'Merchandise',   est:1500,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b11',item:'Welcome kits (badges, cards)',     cat:'Membership',    est:5000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b12',item:'Mementos for PDGs & guests',       cat:'Event',         est:7000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b13',item:'Garlands & bouquets',              cat:'Event',         est:3000,  actual:0,     status:'pending', note:'', updated_by:''},
  {id:'b14',item:'PAN card application fee',         cat:'Admin',         est:200,   actual:200,   status:'paid',    note:'Applied online', updated_by:''},
  {id:'b15',item:'LCI charter fees ($127 / 3 months)',cat:'International', est:10500, actual:10500, status:'paid',    note:'$127 paid via international transfer', updated_by:''},
];
