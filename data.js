/*
 AFCSC Hall of Fame / Our Leaders — SINGLE EDITABLE CONTENT SOURCE
 IMPORTANT: SAMPLE DATA ONLY. This is not an official roll of appointment.
 The supplied images reveal some officer names in filenames, but no verified
 association between the two named AVM portraits and the two current offices.
 No service dates, quote, individual biography, or commendation is supplied.
 Replace or verify every provisional field against the approved AFCSC roll.
*/
window.LEADERS_DATA = {
  project: {
    title: 'Our Leaders',
    college: 'Armed Forces Command and Staff College',
    department: 'Department of Air Warfare',
    location: 'Jaji, Nigeria',
    report: 'AFCSC/527/DAW',
    disclaimer: 'Illustrative preview • appointment mapping, chronology, names and tenures require AFCSC approval.'
  },
  groups: {
    commandant: { title: 'Commandant of the College', short: 'Commandant', code: '01', color: 'blue',
      description: 'Leadership of the Armed Forces Command and Staff College.' },
    director: { title: 'Director of Air Warfare', short: 'Director Air Warfare', code: '02', color: 'red',
      description: 'Leadership of the Department of Air Warfare.' }
  },
  leaders: [
    {
      id: 'c-current', group: 'commandant', current: true, rank: 'Air Vice Marshal',
      name: 'O. A. Tuwase', appointment: 'Commandant of the College',
      tenure: 'Dates awaiting verification', photo: 'assets/current/avm-oa-tuwase.jpg',
      photoCredit: 'Supplied photograph; provisional appointment pairing',
      verified: false, biography: '', quote: '', contributions: [],
      sequence: 0
    },
    {
      id: 'd-current', group: 'director', current: true, rank: 'Air Vice Marshal',
      name: 'E. O. Alade', appointment: 'Director of Air Warfare',
      tenure: 'Dates awaiting verification', photo: 'assets/current/avm-eo-alade.jpg',
      photoCredit: 'Supplied photograph; provisional appointment pairing',
      verified: false, biography: '', quote: '', contributions: [],
      sequence: 0
    },
    // Historical Commandant sample slots use numbered, unlabelled uploaded photographs.
    // They are NOT verified name-to-photo pairings or actual role assignments.
    ...[1,2,3,4,5,6].map(i => ({
      id: 'c-past-'+i, group: 'commandant', current: false,
      rank: 'Rank pending verification', name: 'Historical Profile '+String(i).padStart(2,'0'),
      appointment: 'Commandant of the College — sample slot',
      tenure: 'Tenure not provided',
      photo: 'assets/commandants/photo-'+String(i).padStart(2,'0')+'.png',
      photoCredit: 'Unidentified supplied portrait; association unverified',
      verified: false, biography: '', quote: '', contributions: [], sequence: i
    })),
    // Eight representative names read only from supplied filenames; dates are unavailable.
    // Sequence follows FILE NUMBER, NOT a verified tenure chronology.
    ...[
      ['28','Air Commodore','A. S. Liman','28-air-cdre-as-liman.jpg'],
      ['29','Air Commodore','N. K. Kumzhi','29-air-cdre-nk-kumzhi.jpg'],
      ['30','Air Commodore','H. I. Alhaji','30-air-cdre-hi-alhaji.jpg'],
      ['31','Air Commodore','A. Y. Dari','31-air-cdre-ay-dari.jpg'],
      ['32','Air Commodore','C. O. Obiabaka','32-air-cdre-co-obiabaka.jpg'],
      ['33','Air Commodore','E. A. Ola','33-air-cdre-ea-ola.jpg'],
      ['34','Air Commodore','A. Audu','34-air-cdre-a-audu.jpg'],
      ['35','Air Commodore','S. M. Chindo','35-air-cdre-sm-chindo.jpg']
    ].map((a,i) => ({
      id: 'd-past-'+(i+1), group:'director', current:false, rank:a[1], name:a[2],
      appointment:'Director of Air Warfare — sample roll entry',
      tenure:'Tenure not provided',photo:'assets/directors/'+a[3],
      photoCredit:'Name and rank transcribed from supplied filename; appointment, chronology and dates unverified',
      verified:false,biography:'',quote:'',contributions:[],sequence:i+1
    }))
  ],
  // Full image catalogue: files are reference assets, not an authenticated service roll.
  archive: [
    ...Array.from({length:13},(_,i)=>({
      id:'archive-commandant-'+(i+1),group:'commandant',name:'Unidentified portrait '+String(i+1).padStart(2,'0'),
      rank:'Not supplied',photo:'assets/commandants/photo-'+String(i+1).padStart(2,'0')+'.png',
      note:'No verified identity or tenure supplied.'
    })),
    ...[
      '01-gp-capt-u-muazu.jpg','02-gp-capt-go-esho.jpg','03-gp-capt-cu-ugah.jpg','04-gp-capt-s-magaji.jpg',
      '05-air-cdre-ah-lawal.jpg','06-air-cdre-ae-okpere.jpg','07-gp-capt-a-okpanachi.jpg','08-air-cdre-mm-aliyu.jpg',
      '09-air-cdre-ja-mbaka.jpg','10-gp-capt-ma-johnson.jpg','11-gp-capt-vo-omozokpia.jpg','12-air-cdre-jo-sunmonu.jpg',
      '13-air-cdre-vc-akiti.jpg','14-air-cdre-ja-akawo.jpg','15-air-cdre-i-abdulrahman.jpg','16-air-cdre-eu-okundaye.jpg',
      '17-air-cdre-ja-kolawole.jpg','18-air-cdre-kr-ekezie.jpg','19-air-cdre-tm-ato.jpg','20-air-cdre-i-danbauchi.jpg',
      '21-air-cdre-ja-udo.jpg','22-air-cdre-sa-leks.jpg','23-air-cdre-my-oladunni.jpg','24-air-cdre-go-ekagbo.jpg',
      '25-air-cdre-sg-jeff-zanni.jpg','26-air-cdre-no-oyibo.jpg','27-air-cdre-fm-makinde.jpg',
      '28-air-cdre-as-liman.jpg','29-air-cdre-nk-kumzhi.jpg','30-air-cdre-hi-alhaji.jpg','31-air-cdre-ay-dari.jpg',
      '32-air-cdre-co-obiabaka.jpg','33-air-cdre-ea-ola.jpg','34-air-cdre-a-audu.jpg','35-air-cdre-sm-chindo.jpg'
    ].map(filename=>{
      const stem=filename.replace(/\.jpg$/,'').replace(/^\d+-/,'');
      const parts=stem.split('-');
      const rank=parts[0]==='gp'?'Group Captain':'Air Commodore';
      const initStart=parts[0]==='gp'?2:2;
      const nameParts=parts.slice(initStart);
      let name=nameParts.map((p,i)=>i===0&&p.length<=3?p.toUpperCase().split('').join('. ')+'.':p.charAt(0).toUpperCase()+p.slice(1)).join(' ');
      return {id:'archive-'+filename,group:'director',name,rank,photo:'assets/directors/'+filename,
       note:'Name read from filename only. Service record and position in official roll require verification.'};
    })
  ]
};
