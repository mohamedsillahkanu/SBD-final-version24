// ============================================================
//  ICF-SL  ai_agent.js
//  • Floating AI Agent button + modal  (GAS-backed, no API key in browser)
//  • Enhanced Analysis modal  (cascading filters + Chart.js charts)
// ============================================================
(function () {
    'use strict';

    const GAS_URL = 'https://script.google.com/macros/s/AKfycbymRy-M5v0fVLWUjw4IXYhd1oIR2ZvnP_Dzr_iGR-Th0cMIpmE2ntGeujWYH7-C6NHIzA/exec';

    // ════════════════════════════════════════════════════════
    //  STYLES  (floating button + modal only)
    // ════════════════════════════════════════════════════════
    const style = document.createElement('style');
    style.textContent = `
    #icfAiBtn{position:fixed;bottom:24px;right:20px;z-index:9000;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#004080 0%,#0066cc 100%);border:3px solid #fff;box-shadow:0 4px 20px rgba(0,64,128,.45);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;animation:icf-pulse 2.8s ease-in-out infinite;}
    #icfAiBtn:hover{transform:scale(1.1);}
    #icfAiBtn svg{width:26px;height:26px;stroke:#fff;}
    @keyframes icf-pulse{0%,100%{box-shadow:0 4px 20px rgba(0,64,128,.45);}50%{box-shadow:0 4px 30px rgba(0,64,128,.75);}}
    #icfAiBadge{position:absolute;top:-4px;right:-4px;background:#f0a500;color:#fff;border-radius:10px;font-size:9px;font-weight:700;font-family:'Oswald',sans-serif;padding:2px 6px;letter-spacing:.4px;border:2px solid #fff;}
    #icfAiOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9100;display:none;justify-content:center;align-items:flex-end;padding:12px;}
    #icfAiOverlay.show{display:flex;}
    #icfAiModal{background:#fff;border-radius:16px 16px 12px 12px;border:3px solid #004080;width:100%;max-width:680px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.35);overflow:hidden;}
    .icf-ai-head{background:linear-gradient(135deg,#002d5a 0%,#004080 100%);color:#fff;padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}
    .icf-ai-head-icon{width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .icf-ai-head-icon svg{width:20px;height:20px;stroke:#fff;}
    .icf-ai-head-info{flex:1;}
    .icf-ai-head-title{font-family:'Oswald',sans-serif;font-size:16px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;line-height:1.2;}
    .icf-ai-head-sub{font-size:10px;color:rgba(255,255,255,.7);}
    .icf-ai-head-actions{display:flex;gap:6px;}
    .icf-ai-hbtn{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:6px 10px;cursor:pointer;color:#fff;font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:.5px;display:flex;align-items:center;gap:5px;transition:background .15s;}
    .icf-ai-hbtn:hover{background:rgba(255,255,255,.22);}
    .icf-ai-hbtn svg{width:13px;height:13px;stroke:#fff;}
    .icf-ai-hbtn.gold{background:rgba(240,165,0,.25);border-color:rgba(240,165,0,.5);}
    .icf-ai-stats{background:#e8f1fa;border-bottom:2px solid #c5d9f0;padding:8px 16px;display:flex;gap:16px;flex-shrink:0;overflow-x:auto;}
    .icf-ai-stats::-webkit-scrollbar{display:none;}
    .icf-ai-stat{text-align:center;white-space:nowrap;}
    .icf-ai-stat-val{font-family:'Oswald',sans-serif;font-size:17px;font-weight:700;color:#004080;line-height:1;}
    .icf-ai-stat-lbl{font-size:9px;color:#555;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;}
    .icf-ai-stat-div{width:1px;background:#bcd3eb;align-self:stretch;margin:2px 0;}
    #icfAiMessages{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:12px;background:#f8fafd;}
    .icf-msg{display:flex;gap:8px;align-items:flex-start;}.icf-msg.user{flex-direction:row-reverse;}
    .icf-msg-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
    .icf-msg.ai .icf-msg-av{background:#004080;}.icf-msg.user .icf-msg-av{background:#f0a500;}
    .icf-msg-av svg{width:14px;height:14px;stroke:#fff;}
    .icf-bub{max-width:calc(100% - 44px);padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.55;word-break:break-word;}
    .icf-msg.ai .icf-bub{background:#fff;border:1.5px solid #c5d9f0;border-top-left-radius:4px;color:#222;}
    .icf-msg.user .icf-bub{background:#004080;color:#fff;border-top-right-radius:4px;}
    .icf-bub strong{font-weight:700;}.icf-bub code{background:rgba(0,64,128,.08);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:12px;}
    .icf-msg.user .icf-bub code{background:rgba(255,255,255,.18);}
    .icf-typing{display:flex;align-items:center;gap:4px;padding:6px 0;}
    .icf-typing span{width:7px;height:7px;background:#004080;border-radius:50%;animation:icf-bnc .9s ease-in-out infinite;}
    .icf-typing span:nth-child(2){animation-delay:.15s;}.icf-typing span:nth-child(3){animation-delay:.30s;}
    @keyframes icf-bnc{0%,100%{transform:translateY(0);opacity:.4;}50%{transform:translateY(-5px);opacity:1;}}
    .icf-samples{padding:8px 16px 6px;flex-shrink:0;border-top:1px solid #e0eaf5;}
    .icf-sq-lbl{font-size:9px;font-family:'Oswald',sans-serif;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;}
    .icf-sq-row{display:flex;gap:6px;flex-wrap:wrap;}
    .icf-sq{background:#e8f1fa;border:1.5px solid #b3cde8;border-radius:20px;padding:5px 12px;font-size:11px;color:#004080;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s;font-family:'Oswald',sans-serif;}
    .icf-sq:hover{background:#004080;color:#fff;border-color:#004080;}
    .icf-inp-row{display:flex;gap:8px;padding:10px 14px 12px;border-top:2px solid #dce8f5;background:#fff;flex-shrink:0;align-items:flex-end;}
    #icfAiInput{flex:1;border:2px solid #c5d9f0;border-radius:24px;padding:9px 16px;font-size:13px;font-family:'Oswald','Segoe UI',Arial,sans-serif;outline:none;resize:none;transition:border-color .2s;line-height:1.4;}
    #icfAiInput:focus{border-color:#004080;}
    #icfAiSend{background:#004080;border:none;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background .2s,transform .15s;}
    #icfAiSend:hover{background:#00306a;transform:scale(1.08);}
    #icfAiSend:disabled{background:#aaa;cursor:not-allowed;transform:none;}
    #icfAiSend svg{width:18px;height:18px;stroke:#fff;}
    .icf-clr{background:none;border:none;font-size:10px;color:#aaa;cursor:pointer;letter-spacing:.4px;text-transform:uppercase;font-family:'Oswald',sans-serif;padding:0 4px;transition:color .15s;}
    .icf-clr:hover{color:#dc3545;}
    .icf-pill{display:inline-flex;align-items:center;gap:5px;font-size:10px;padding:3px 10px;border-radius:12px;font-family:'Oswald',sans-serif;margin-bottom:8px;}
    .icf-pill.ok{background:#d4edda;color:#155724;}.icf-pill.err{background:#f8d7da;color:#721c24;}.icf-pill.chk{background:#e2e3e5;color:#383d41;}
    .icf-dot{width:7px;height:7px;border-radius:50%;}
    .ok .icf-dot{background:#28a745;}.err .icf-dot{background:#dc3545;}.chk .icf-dot{background:#888;animation:icf-bnc .9s ease-in-out infinite;}
    .icf-welcome{background:#fff;border:2px solid #c5d9f0;border-radius:12px;padding:18px 16px;text-align:center;}
    .icf-welcome-icon{font-size:32px;margin-bottom:8px;}
    .icf-welcome-title{font-family:'Oswald',sans-serif;font-size:15px;color:#004080;font-weight:600;letter-spacing:.5px;margin-bottom:6px;}
    .icf-welcome-body{font-size:12px;color:#555;line-height:1.6;}
    .icf-foot{font-size:10px;color:#aaa;text-align:center;padding:4px;font-style:italic;font-family:'Oswald',sans-serif;}
    @media(max-width:520px){#icfAiModal{max-height:93vh;border-radius:14px 14px 0 0;}}

    /* Analysis modal charts */
    .an-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:18px;}
    .an-kpi{background:#fff;border:2px solid #d0dce8;border-radius:10px;padding:16px 12px;text-align:center;}
    .an-kpi.g{border-color:#28a745;}.an-kpi.r{border-color:#dc3545;}.an-kpi.o{border-color:#f0a500;}.an-kpi.p{border-color:#e91e8c;}
    .an-kpi-val{font-family:'Oswald',sans-serif;font-size:28px;font-weight:700;color:#004080;line-height:1;}
    .an-kpi.g .an-kpi-val{color:#28a745;}.an-kpi.r .an-kpi-val{color:#dc3545;}.an-kpi.o .an-kpi-val{color:#b8860b;}.an-kpi.p .an-kpi-val{color:#e91e8c;}
    .an-kpi-lbl{font-size:10px;color:#607080;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;font-family:'Oswald',sans-serif;}
    .an-chart-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
    .an-chart-row.three{grid-template-columns:1fr 1fr 1fr;}
    .an-chart-row.full{grid-template-columns:1fr;}
    .an-chart-box{background:#fff;border:2px solid #d0dce8;border-radius:10px;padding:14px 14px 10px;position:relative;}
    .an-chart-title{font-family:'Oswald',sans-serif;font-size:12px;font-weight:600;color:#004080;letter-spacing:.5px;text-transform:uppercase;margin-bottom:10px;text-align:center;}
    .an-chart-box canvas{max-height:220px;}
    .an-no-data{text-align:center;padding:60px 20px;color:#8090a0;font-family:'Oswald',sans-serif;font-size:14px;letter-spacing:.5px;}
    .an-table-wrap{border:2px solid #d0dce8;border-radius:10px;overflow-x:auto;margin-bottom:14px;}
    .an-tbl{width:100%;border-collapse:collapse;font-size:12px;}
    .an-tbl thead{background:linear-gradient(135deg,#004080,#1a6abf);color:#fff;}
    .an-tbl th{padding:10px 12px;font-family:'Oswald',sans-serif;font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;text-align:left;}
    .an-tbl td{padding:9px 12px;border-bottom:1px solid #f0f4f8;}
    .an-tbl tr:last-child td{border-bottom:none;}
    .an-tbl tr:hover td{background:#f4f8fc;}
    .an-tbl tr:nth-child(even) td{background:#fafcff;}
    .an-cov-bar{background:#e4eaf2;border-radius:3px;height:6px;overflow:hidden;min-width:60px;}
    .an-cov-fill{height:100%;border-radius:3px;transition:width .4s;}
    @media(max-width:600px){.an-chart-row,.an-chart-row.three{grid-template-columns:1fr;}}
    `;
    document.head.appendChild(style);

    // ════════════════════════════════════════════════════════
    //  SAMPLE QUESTIONS
    // ════════════════════════════════════════════════════════
    const SAMPLES = [
        'How many schools have been submitted?','What is the overall ITN coverage rate?',
        'Which district has the most submissions?','Show coverage breakdown by gender',
        'How many ITNs were distributed in total?','List schools with coverage below 80%',
        'What is the average enrollment per school?','How many schools are still pending?',
        'Compare boys vs girls ITN coverage','Which schools received IG2 nets?',
        'What proportion of pupils are girls?','How many ITNs remain after distribution?',
        'Give me a summary by chiefdom','Which class has the highest coverage?',
        'Who submitted the most records?','Which school has the highest total pupils?',
    ];
    function pickN(n){const p=[...SAMPLES],o=[];while(o.length<n&&p.length){const i=Math.floor(Math.random()*p.length);o.push(p.splice(i,1)[0]);}return o;}

    function renderSamples(){
        const r=document.getElementById('icfSqRow');if(!r)return;
        r.innerHTML='';
        pickN(4).forEach(q=>{const b=document.createElement('button');b.className='icf-sq';b.textContent=q;b.onclick=()=>icfAiAskQuestion(q);r.appendChild(b);});
    }

    // ════════════════════════════════════════════════════════
    //  SHARED: DATA CONTEXT + GAS CALL + MARKDOWN
    // ════════════════════════════════════════════════════════
    function buildContext(){
        try{
            const s=window.state||{};
            const all=[...(s.submittedSchools||[]).map(r=>r.data||r),...(s.pendingSubmissions||[])];
            if(!all.length)return null;
            let tp=0,ti=0,tb=0,tg=0,tbi=0,tgi=0,tr=0,trem=0;
            const byDist={},schools=[];
            all.forEach(r=>{
                const vp=parseInt(r.total_pupils)||0,vi=parseInt(r.total_itn)||0,vb=parseInt(r.total_boys)||0,vg=parseInt(r.total_girls)||0,
                      vbi=parseInt(r.total_boys_itn)||0,vgi=parseInt(r.total_girls_itn)||0,vr=parseInt(r.itns_received)||0,vrem=parseInt(r.itns_remaining||r.itns_remaining_val)||0;
                tp+=vp;ti+=vi;tb+=vb;tg+=vg;tbi+=vbi;tgi+=vgi;tr+=vr;trem+=vrem;
                const d=r.district||'Unknown';
                if(!byDist[d])byDist[d]={s:0,p:0,i:0};
                byDist[d].s++;byDist[d].p+=vp;byDist[d].i+=vi;
                schools.push({school:r.school_name||'—',com:r.community||'—',chief:r.chiefdom||'—',dist:r.district||'—',date:r.distribution_date||'—',by:r.submitted_by||'—',pupils:vp,boys:vb,girls:vg,itn:vi,bITN:vbi,gITN:vgi,rec:vr,rem:vrem,cov:vp>0?Math.round((vi/vp)*100)+'%':'0%',types:[r.itn_type_pbo==='Yes'?'PBO':'',r.itn_type_ig2==='Yes'?'IG2':''].filter(Boolean).join(',')||'—',c1b:+r.c1_boys||0,c1g:+r.c1_girls||0,c1bi:+r.c1_boys_itn||0,c1gi:+r.c1_girls_itn||0,c2b:+r.c2_boys||0,c2g:+r.c2_girls||0,c2bi:+r.c2_boys_itn||0,c2gi:+r.c2_girls_itn||0,c3b:+r.c3_boys||0,c3g:+r.c3_girls||0,c3bi:+r.c3_boys_itn||0,c3gi:+r.c3_girls_itn||0,c4b:+r.c4_boys||0,c4g:+r.c4_girls||0,c4bi:+r.c4_boys_itn||0,c4gi:+r.c4_girls_itn||0,c5b:+r.c5_boys||0,c5g:+r.c5_girls||0,c5bi:+r.c5_boys_itn||0,c5gi:+r.c5_girls_itn||0});
            });
            const ov=tp>0?Math.round((ti/tp)*100):0,bc=tb>0?Math.round((tbi/tb)*100):0,gc=tg>0?Math.round((tgi/tg)*100):0;
            let ctx=`=== ICF-SL ITN DATA (${new Date().toLocaleDateString()}) ===\nSchools:${all.length} | Pupils:${tp}(${tb}B/${tg}G) | Received:${tr} | Distributed:${ti} | Remaining:${trem}\nCoverage:${ov}% overall|${bc}% boys|${gc}% girls\nBY DISTRICT:\n`;
            Object.entries(byDist).forEach(([d,v])=>{ctx+=`  ${d}:${v.s} schools,${v.p} pupils,${v.p>0?Math.round((v.i/v.p)*100):0}%\n`;});
            ctx+=`SCHOOL RECORDS:\n`;
            schools.forEach((s,i)=>{ctx+=`[${i+1}] ${s.school}(${s.com},${s.chief},${s.dist})|${s.date}|by:${s.by}\n  Pupils:${s.pupils}(${s.boys}B/${s.girls}G)|ITN:${s.itn}|Rem:${s.rem}|Cov:${s.cov}|Types:${s.types}\n  C1:${s.c1b}B/${s.c1g}G(${s.c1bi}/${s.c1gi}) C2:${s.c2b}B/${s.c2g}G(${s.c2bi}/${s.c2gi}) C3:${s.c3b}B/${s.c3g}G(${s.c3bi}/${s.c3gi}) C4:${s.c4b}B/${s.c4g}G(${s.c4bi}/${s.c4gi}) C5:${s.c5b}B/${s.c5g}G(${s.c5bi}/${s.c5gi})\n`;});
            return ctx;
        }catch{return null;}
    }

    async function callGAS(msg,history){
        const res=await fetch(GAS_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'ai_query',message:msg,history:(history||[]).slice(-10),context:buildContext()||''})});
        if(!res.ok)throw new Error('GAS HTTP '+res.status);
        const data=await res.json();
        if(!data.success)throw new Error(data.error||'GAS error');
        return data.reply;
    }

    function md(t){
        return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
            .replace(/`(.+?)`/g,'<code>$1</code>')
            .replace(/^#{1,3} (.+)$/gm,'<strong style="font-size:13px;text-transform:uppercase;letter-spacing:.5px;color:#004080;display:block;margin-top:6px">$1</strong>')
            .replace(/^- (.+)$/gm,'<span style="display:block;padding-left:14px;margin:2px 0">• $1</span>')
            .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
    }

    // ════════════════════════════════════════════════════════
    //  STATS STRIP
    // ════════════════════════════════════════════════════════
    function statsHTML(sheetCount){
        const s=window.state||{};
        const sess=(s.submittedSchools||[]).length,pend=(s.pendingSubmissions||[]).length,drft=(s.drafts||[]).length;
        let tp=0,ti=0;
        [...(s.submittedSchools||[]).map(r=>r.data||r),...(s.pendingSubmissions||[])].forEach(r=>{tp+=parseInt(r.total_pupils||0)||0;ti+=parseInt(r.total_itn||0)||0;});
        const pct=tp>0?Math.round((ti/tp)*100):0;
        const sep='<div class="icf-ai-stat-div"></div>';
        return[`<div class="icf-ai-stat"><div class="icf-ai-stat-val">${sess}</div><div class="icf-ai-stat-lbl">Session</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val" style="color:#28a745">${sheetCount!==null?sheetCount:'…'}</div><div class="icf-ai-stat-lbl">In Sheet</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val" style="color:#e6a800">${pend}</div><div class="icf-ai-stat-lbl">Pending</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val">${drft}</div><div class="icf-ai-stat-lbl">Drafts</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val">${tp.toLocaleString()}</div><div class="icf-ai-stat-lbl">Pupils</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val">${ti.toLocaleString()}</div><div class="icf-ai-stat-lbl">ITNs</div></div>`,sep,`<div class="icf-ai-stat"><div class="icf-ai-stat-val" style="color:${pct>=80?'#28a745':pct>=50?'#e6a800':'#dc3545'}">${pct}%</div><div class="icf-ai-stat-lbl">Coverage</div></div>`].join('');
    }

    async function fetchCount(){try{const r=await fetch(GAS_URL+'?action=count');const d=await r.json();return d.count!==undefined?d.count:'?';}catch{return'?';}}

    window.icfAiRefreshStats=async function(){
        const el=document.getElementById('icfAiStats');if(el)el.innerHTML=statsHTML(null);
        setStatus('chk','Checking GAS connection…');
        const c=await fetchCount();
        if(el)el.innerHTML=statsHTML(c);
        setStatus(c==='?'?'err':'ok',c==='?'?'GAS unreachable':'GAS connected · '+c+' records in Sheet');
    };

    function setStatus(t,m){const el=document.getElementById('icfGasStatus');if(el)el.innerHTML=`<div class="icf-pill ${t}"><div class="icf-dot"></div>${m}</div>`;}

    // ════════════════════════════════════════════════════════
    //  FLOATING MODAL CHAT
    // ════════════════════════════════════════════════════════
    let chatHist=[];

    function addMsg(role,text){
        const w=document.getElementById('icfAiMessages');if(!w)return;
        const d=document.createElement('div');d.className='icf-msg '+role;
        const isAI=role==='ai';
        d.innerHTML=`<div class="icf-msg-av">${isAI?'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}</div><div class="icf-bub"></div>`;
        w.appendChild(d);d.querySelector('.icf-bub').innerHTML=md(text);w.scrollTop=w.scrollHeight;
    }

    function showTyp(on){
        if(on){
            const w=document.getElementById('icfAiMessages');if(!w)return;
            const d=document.createElement('div');d.className='icf-msg ai';d.id='icfTyp';
            d.innerHTML='<div class="icf-msg-av"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></div><div class="icf-bub"><div class="icf-typing"><span></span><span></span><span></span></div></div>';
            w.appendChild(d);w.scrollTop=w.scrollHeight;
        }else{const e=document.getElementById('icfTyp');if(e)e.remove();}
    }

    window.icfAiSend=async function(){
        const inp=document.getElementById('icfAiInput'),btn=document.getElementById('icfAiSend');
        if(!inp)return;const q=inp.value.trim();if(!q)return;
        inp.value='';icfAiAutoResize(inp);
        addMsg('user',q);chatHist.push({role:'user',content:q});
        showTyp(true);if(btn)btn.disabled=true;
        try{const r=await callGAS(q,chatHist);showTyp(false);addMsg('ai',r);chatHist.push({role:'assistant',content:r});renderSamples();}
        catch(e){showTyp(false);addMsg('ai',`⚠️ **Error:** ${e.message}\n\nVerify GAS URL and "Who has access: Anyone".`);}
        finally{if(btn)btn.disabled=false;if(inp)inp.focus();}
    };
    window.icfAiAskQuestion=function(q){const i=document.getElementById('icfAiInput');if(i){i.value=q;icfAiAutoResize(i);}icfAiSend();};
    window.icfAiKeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();icfAiSend();}};
    window.icfAiAutoResize=el=>{el.style.height='auto';el.style.height=Math.min(el.scrollHeight,110)+'px';};
    window.icfAiClearChat=function(){chatHist=[];const w=document.getElementById('icfAiMessages');if(w)w.innerHTML='<div class="icf-welcome"><div class="icf-welcome-icon">🔄</div><div class="icf-welcome-title">Chat cleared</div><div class="icf-welcome-body">Ask me anything about your ITN distribution data.</div></div><div id="icfGasStatus"></div>';renderSamples();};
    window.icfAiOpen=function(){document.getElementById('icfAiOverlay').classList.add('show');const el=document.getElementById('icfAiStats');if(el)el.innerHTML=statsHTML(null);renderSamples();icfAiRefreshStats();setTimeout(()=>{const i=document.getElementById('icfAiInput');if(i)i.focus();},200);};
    window.icfAiClose=()=>document.getElementById('icfAiOverlay').classList.remove('show');
    window.icfAiOverlayClick=e=>{if(e.target.id==='icfAiOverlay')icfAiClose();};
    document.addEventListener('keydown',e=>{if(e.key==='Escape')icfAiClose();});

    // ════════════════════════════════════════════════════════
    //  ENHANCED ANALYSIS MODAL
    // ════════════════════════════════════════════════════════
    let anCharts = {};   // store Chart instances so we can destroy them

    // ── Cascading filter helpers ──────────────────────────
    function getLoc(){return(window.ALL_LOCATION_DATA&&Object.keys(window.ALL_LOCATION_DATA).length)?window.ALL_LOCATION_DATA:window.LOCATION_DATA||{};}

    function afReset(id,placeholder,disabled){
        const el=document.getElementById(id);if(!el)return;
        el.innerHTML=`<option value="">${placeholder}</option>`;
        el.disabled=!!disabled;
    }
    function afFill(id,opts,disabled){
        const el=document.getElementById(id);if(!el)return;
        el.innerHTML='<option value="">All</option>';
        opts.sort().forEach(o=>{const op=document.createElement('option');op.value=op.textContent=o;el.appendChild(op);});
        el.disabled=!!disabled;
    }

    window.afCascade=function(level){
        const loc=getLoc();
        const d=document.getElementById('af_district')?.value||'';
        const c=document.getElementById('af_chiefdom')?.value||'';
        const s=document.getElementById('af_section')?.value||'';
        const f=document.getElementById('af_facility')?.value||'';
        const com=document.getElementById('af_community')?.value||'';

        if(level==='district'){
            afReset('af_chiefdom','All Chiefdoms',true);afReset('af_section','All Sections',true);afReset('af_facility','All Facilities',true);afReset('af_community','All Communities',true);afReset('af_school','All Schools',true);
            if(d&&loc[d]){afFill('af_chiefdom',Object.keys(loc[d]),false);}
        }
        if(level==='chiefdom'){
            afReset('af_section','All Sections',true);afReset('af_facility','All Facilities',true);afReset('af_community','All Communities',true);afReset('af_school','All Schools',true);
            if(d&&c&&loc[d]?.[c]){afFill('af_section',Object.keys(loc[d][c]),false);}
        }
        if(level==='section'){
            afReset('af_facility','All Facilities',true);afReset('af_community','All Communities',true);afReset('af_school','All Schools',true);
            if(d&&c&&s&&loc[d]?.[c]?.[s]){afFill('af_facility',Object.keys(loc[d][c][s]),false);}
        }
        if(level==='facility'){
            afReset('af_community','All Communities',true);afReset('af_school','All Schools',true);
            if(d&&c&&s&&f&&loc[d]?.[c]?.[s]?.[f]){afFill('af_community',Object.keys(loc[d][c][s][f]),false);}
        }
        if(level==='community'){
            afReset('af_school','All Schools',true);
            if(d&&c&&s&&f&&com&&loc[d]?.[c]?.[s]?.[f]?.[com]){afFill('af_school',loc[d][c][s][f][com],false);}
        }
        runAnalysis();
    };

    window.clearAnalysisFilters=function(){
        ['af_district','af_chiefdom','af_section','af_facility','af_community','af_school'].forEach(id=>{
            const el=document.getElementById(id);if(!el)return;
            el.innerHTML=id==='af_district'?'<option value="">All Districts</option>':'<option value="">All</option>';
            el.disabled=id!=='af_district';
        });
        // Re-populate districts
        const loc=getLoc();
        const dd=document.getElementById('af_district');
        if(dd){Object.keys(loc).sort().forEach(d=>{const o=document.createElement('option');o.value=o.textContent=d;dd.appendChild(o);});}
        runAnalysis();
    };

    // ── Filter the data ───────────────────────────────────
    function getFilteredData(){
        const s=window.state||{};
        let all=[...(s.submittedSchools||[]).map(r=>r.data||r),...(s.pendingSubmissions||[])];
        const fD=document.getElementById('af_district')?.value||'';
        const fC=document.getElementById('af_chiefdom')?.value||'';
        const fS=document.getElementById('af_section')?.value||'';
        const fF=document.getElementById('af_facility')?.value||'';
        const fCom=document.getElementById('af_community')?.value||'';
        const fSch=document.getElementById('af_school')?.value||'';
        if(fD)   all=all.filter(r=>(r.district||'').toLowerCase()===fD.toLowerCase());
        if(fC)   all=all.filter(r=>(r.chiefdom||'').toLowerCase()===fC.toLowerCase());
        if(fS)   all=all.filter(r=>(r.section_loc||'').toLowerCase()===fS.toLowerCase());
        if(fF)   all=all.filter(r=>(r.facility||'').toLowerCase()===fF.toLowerCase());
        if(fCom) all=all.filter(r=>(r.community||'').toLowerCase()===fCom.toLowerCase());
        if(fSch) all=all.filter(r=>(r.school_name||'').toLowerCase()===fSch.toLowerCase());
        return all;
    }

    // ── Destroy all chart instances ───────────────────────
    function destroyCharts(){
        Object.values(anCharts).forEach(c=>{try{c.destroy();}catch(e){}});
        anCharts={};
    }

    // ── Coverage colour ───────────────────────────────────
    function covColor(pct){return pct>=80?'#28a745':pct>=50?'#f0a500':'#dc3545';}
    function covBg(pct){return pct>=80?'rgba(40,167,69,.15)':pct>=50?'rgba(240,165,0,.15)':'rgba(220,53,69,.15)';}

    // ── Main analysis renderer ────────────────────────────
    window.runAnalysis=function(){
        destroyCharts();
        const body=document.getElementById('analysisBody');
        if(!body)return;
        const all=getFilteredData();

        if(!all.length){
            body.innerHTML='<div class="an-no-data">📊 No submission data matches the selected filters.</div>';
            return;
        }

        // Aggregate
        let tp=0,ti=0,tb=0,tg=0,tbi=0,tgi=0,tr=0,trem=0;
        const byDist={}, classTot=[0,0,0,0,0], classITN=[0,0,0,0,0];
        const classBoys=[0,0,0,0,0],classGirls=[0,0,0,0,0],classBoysITN=[0,0,0,0,0],classGirlsITN=[0,0,0,0,0];

        all.forEach(r=>{
            const vp=parseInt(r.total_pupils)||0,vi=parseInt(r.total_itn)||0,
                  vb=parseInt(r.total_boys)||0,vg=parseInt(r.total_girls)||0,
                  vbi=parseInt(r.total_boys_itn)||0,vgi=parseInt(r.total_girls_itn)||0,
                  vr=parseInt(r.itns_received)||0,vrem=parseInt(r.itns_remaining||r.itns_remaining_val)||0;
            tp+=vp;ti+=vi;tb+=vb;tg+=vg;tbi+=vbi;tgi+=vgi;tr+=vr;trem+=vrem;
            const d=r.district||'Unknown';
            if(!byDist[d])byDist[d]={p:0,i:0,n:0};
            byDist[d].p+=vp;byDist[d].i+=vi;byDist[d].n++;
            for(let c=1;c<=5;c++){
                classTot[c-1]+=(parseInt(r['c'+c+'_boys'])||0)+(parseInt(r['c'+c+'_girls'])||0);
                classITN[c-1]+=(parseInt(r['c'+c+'_boys_itn'])||0)+(parseInt(r['c'+c+'_girls_itn'])||0);
                classBoys[c-1]+=parseInt(r['c'+c+'_boys'])||0;
                classGirls[c-1]+=parseInt(r['c'+c+'_girls'])||0;
                classBoysITN[c-1]+=parseInt(r['c'+c+'_boys_itn'])||0;
                classGirlsITN[c-1]+=parseInt(r['c'+c+'_girls_itn'])||0;
            }
        });

        const ov=tp>0?Math.round((ti/tp)*100):0;
        const bc=tb>0?Math.round((tbi/tb)*100):0;
        const gc=tg>0?Math.round((tgi/tg)*100):0;
        const classCov=classTot.map((t,i)=>t>0?Math.round((classITN[i]/t)*100):0);
        const distLabels=Object.keys(byDist).sort();
        const distCov=distLabels.map(d=>byDist[d].p>0?Math.round((byDist[d].i/byDist[d].p)*100):0);

        // ── Build HTML ──────────────────────────────────
        body.innerHTML=`
          <!-- KPIs -->
          <div class="an-kpi-row">
            <div class="an-kpi"><div class="an-kpi-val">${all.length}</div><div class="an-kpi-lbl">Schools</div></div>
            <div class="an-kpi"><div class="an-kpi-val">${tp.toLocaleString()}</div><div class="an-kpi-lbl">Total Pupils</div></div>
            <div class="an-kpi o"><div class="an-kpi-val">${tr.toLocaleString()}</div><div class="an-kpi-lbl">ITNs Received</div></div>
            <div class="an-kpi g"><div class="an-kpi-val">${ti.toLocaleString()}</div><div class="an-kpi-lbl">ITNs Distributed</div></div>
            <div class="an-kpi ${trem<0?'r':''}"><div class="an-kpi-val">${trem.toLocaleString()}</div><div class="an-kpi-lbl">Remaining</div></div>
            <div class="an-kpi ${ov>=80?'g':ov>=50?'o':'r'}"><div class="an-kpi-val">${ov}%</div><div class="an-kpi-lbl">Overall Coverage</div></div>
            <div class="an-kpi" style="border-color:#004080;"><div class="an-kpi-val" style="color:#004080;">${bc}%</div><div class="an-kpi-lbl">Boys Coverage</div></div>
            <div class="an-kpi p"><div class="an-kpi-val">${gc}%</div><div class="an-kpi-lbl">Girls Coverage</div></div>
          </div>

          <!-- Row 1: Coverage gauge + Gender enrollment + Gender ITN -->
          <div class="an-chart-row three">
            <div class="an-chart-box">
              <div class="an-chart-title">Overall ITN Coverage</div>
              <canvas id="anCovGauge"></canvas>
            </div>
            <div class="an-chart-box">
              <div class="an-chart-title">Enrollment by Gender</div>
              <canvas id="anGenderEnroll"></canvas>
            </div>
            <div class="an-chart-box">
              <div class="an-chart-title">ITN Distribution by Gender</div>
              <canvas id="anGenderITN"></canvas>
            </div>
          </div>

          <!-- Row 2: Coverage by class + Boys vs Girls ITN coverage -->
          <div class="an-chart-row">
            <div class="an-chart-box">
              <div class="an-chart-title">ITN Coverage by Class (%)</div>
              <canvas id="anClassCov"></canvas>
            </div>
            <div class="an-chart-box">
              <div class="an-chart-title">Boys vs Girls Coverage by Class (%)</div>
              <canvas id="anClassGender"></canvas>
            </div>
          </div>

          <!-- Row 3: Coverage by district (full width) -->
          ${distLabels.length>1?`
          <div class="an-chart-row full">
            <div class="an-chart-box">
              <div class="an-chart-title">ITN Coverage by District (%)</div>
              <canvas id="anDistCov"></canvas>
            </div>
          </div>`:''}

          <!-- Row 4: Enrollment vs ITN by class grouped bar -->
          <div class="an-chart-row full">
            <div class="an-chart-box">
              <div class="an-chart-title">Enrollment vs ITNs Distributed — by Class</div>
              <canvas id="anEnrollVsITN"></canvas>
            </div>
          </div>

          <!-- School table -->
          <div class="an-table-wrap">
            <table class="an-tbl">
              <thead><tr>
                <th>School</th><th>Community</th><th>District</th>
                <th>Pupils</th><th>ITNs</th><th>Coverage</th><th>By</th>
              </tr></thead>
              <tbody>
                ${all.sort((a,b)=>(a.district||'').localeCompare(b.district||'')).map(r=>{
                    const vp=parseInt(r.total_pupils)||0,vi=parseInt(r.total_itn)||0;
                    const cov=vp>0?Math.round((vi/vp)*100):0;
                    const col=covColor(cov),bg=covBg(cov);
                    return`<tr>
                      <td style="font-weight:600;">${r.school_name||'—'}</td>
                      <td>${r.community||'—'}</td>
                      <td>${r.district||'—'}</td>
                      <td style="text-align:center;">${vp}</td>
                      <td style="text-align:center;">${vi}</td>
                      <td style="text-align:center;">
                        <div style="display:flex;align-items:center;gap:6px;justify-content:center;">
                          <div class="an-cov-bar" style="width:50px;"><div class="an-cov-fill" style="width:${Math.min(100,cov)}%;background:${col};"></div></div>
                          <span style="font-weight:700;color:${col};font-size:12px;">${cov}%</span>
                        </div>
                      </td>
                      <td style="font-size:11px;color:#607080;">${r.submitted_by||'—'}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;

        // ── Render Charts ──────────────────────────────
        const chartDefaults={font:{family:"'Oswald',sans-serif"},plugins:{legend:{labels:{font:{family:"'Oswald',sans-serif",size:11}}}}};

        // 1. Coverage gauge donut
        const gaugeCtx=document.getElementById('anCovGauge');
        if(gaugeCtx){
            anCharts.gauge=new Chart(gaugeCtx,{type:'doughnut',data:{labels:['Covered','Remaining'],datasets:[{data:[ov,100-ov],backgroundColor:[covColor(ov),'#e8edf2'],borderWidth:3,borderColor:'#fff'}]},options:{...chartDefaults,cutout:'72%',plugins:{...chartDefaults.plugins,tooltip:{callbacks:{label:c=>c.label+': '+c.parsed+'%'}},legend:{position:'bottom'},title:{display:true,text:ov+'% ITN Coverage',color:covColor(ov),font:{family:"'Oswald',sans-serif",size:18,weight:'700'}}}}});
        }

        // 2. Gender enrollment donut
        const enrollCtx=document.getElementById('anGenderEnroll');
        if(enrollCtx){
            anCharts.enroll=new Chart(enrollCtx,{type:'doughnut',data:{labels:['Boys','Girls'],datasets:[{data:[tb,tg],backgroundColor:['#004080','#e91e8c'],borderWidth:3,borderColor:'#fff'}]},options:{...chartDefaults,cutout:'60%',plugins:{...chartDefaults.plugins,legend:{position:'bottom'}}}});
        }

        // 3. Gender ITN donut
        const itnCtx=document.getElementById('anGenderITN');
        if(itnCtx){
            anCharts.itn=new Chart(itnCtx,{type:'doughnut',data:{labels:['Boys','Girls'],datasets:[{data:[tbi,tgi],backgroundColor:['#004080','#e91e8c'],borderWidth:3,borderColor:'#fff'}]},options:{...chartDefaults,cutout:'60%',plugins:{...chartDefaults.plugins,legend:{position:'bottom'}}}});
        }

        // 4. Coverage by class bar
        const classCovCtx=document.getElementById('anClassCov');
        if(classCovCtx){
            anCharts.classCov=new Chart(classCovCtx,{type:'bar',data:{labels:['Class 1','Class 2','Class 3','Class 4','Class 5'],datasets:[{label:'Coverage %',data:classCov,backgroundColor:classCov.map(v=>v>=80?'rgba(40,167,69,.8)':v>=50?'rgba(240,165,0,.8)':'rgba(220,53,69,.8)'),borderColor:classCov.map(v=>covColor(v)),borderWidth:2,borderRadius:6}]},options:{...chartDefaults,scales:{y:{beginAtZero:true,max:100,grid:{color:'rgba(0,0,0,.05)'},ticks:{callback:v=>v+'%',font:{family:"'Oswald',sans-serif",size:11}},title:{display:true,text:'Coverage %',font:{family:"'Oswald',sans-serif",size:11}}},x:{ticks:{font:{family:"'Oswald',sans-serif",size:11}},grid:{display:false}}},plugins:{...chartDefaults.plugins,legend:{display:false},annotation:{annotations:{line80:{type:'line',yMin:80,yMax:80,borderColor:'#28a745',borderWidth:1.5,borderDash:[4,4]}}}}}});
        }

        // 5. Boys vs Girls coverage by class
        const classGCtx=document.getElementById('anClassGender');
        if(classGCtx){
            const boysCov=classBoys.map((b,i)=>b>0?Math.round((classBoysITN[i]/b)*100):0);
            const girlsCov=classGirls.map((g,i)=>g>0?Math.round((classGirlsITN[i]/g)*100):0);
            anCharts.classG=new Chart(classGCtx,{type:'bar',data:{labels:['Class 1','Class 2','Class 3','Class 4','Class 5'],datasets:[{label:'Boys',data:boysCov,backgroundColor:'rgba(0,64,128,.75)',borderColor:'#004080',borderWidth:2,borderRadius:5},{label:'Girls',data:girlsCov,backgroundColor:'rgba(233,30,140,.7)',borderColor:'#e91e8c',borderWidth:2,borderRadius:5}]},options:{...chartDefaults,scales:{y:{beginAtZero:true,max:100,ticks:{callback:v=>v+'%',font:{family:"'Oswald',sans-serif",size:11}},grid:{color:'rgba(0,0,0,.05)'}},x:{ticks:{font:{family:"'Oswald',sans-serif",size:11}},grid:{display:false}}},plugins:{...chartDefaults.plugins,legend:{position:'bottom'}}}});
        }

        // 6. Coverage by district (only if >1 district)
        if(distLabels.length>1){
            const distCtx=document.getElementById('anDistCov');
            if(distCtx){
                anCharts.dist=new Chart(distCtx,{type:'bar',data:{labels:distLabels,datasets:[{label:'Coverage %',data:distCov,backgroundColor:distCov.map(v=>v>=80?'rgba(40,167,69,.8)':v>=50?'rgba(240,165,0,.8)':'rgba(220,53,69,.8)'),borderColor:distCov.map(v=>covColor(v)),borderWidth:2,borderRadius:6}]},options:{...chartDefaults,indexAxis:'y',scales:{x:{beginAtZero:true,max:100,ticks:{callback:v=>v+'%',font:{family:"'Oswald',sans-serif",size:11}},grid:{color:'rgba(0,0,0,.05)'}},y:{ticks:{font:{family:"'Oswald',sans-serif",size:11}},grid:{display:false}}},plugins:{...chartDefaults.plugins,legend:{display:false}}}});
            }
        }

        // 7. Enrollment vs ITN grouped bar by class
        const evCtx=document.getElementById('anEnrollVsITN');
        if(evCtx){
            anCharts.ev=new Chart(evCtx,{type:'bar',data:{labels:['Class 1','Class 2','Class 3','Class 4','Class 5'],datasets:[{label:'Enrolled',data:classTot,backgroundColor:'rgba(0,64,128,.25)',borderColor:'#004080',borderWidth:2,borderRadius:5},{label:'Received ITN',data:classITN,backgroundColor:'rgba(40,167,69,.7)',borderColor:'#28a745',borderWidth:2,borderRadius:5}]},options:{...chartDefaults,scales:{y:{beginAtZero:true,ticks:{font:{family:"'Oswald',sans-serif",size:11}},grid:{color:'rgba(0,0,0,.05)'}},x:{ticks:{font:{family:"'Oswald',sans-serif",size:11}},grid:{display:false}}},plugins:{...chartDefaults.plugins,legend:{position:'bottom'}}}});
        }
    };

    // ════════════════════════════════════════════════════════
    //  TAB SWITCHING  (DATA ENTRY ↔ ANALYSIS)
    // ════════════════════════════════════════════════════════
    window.switchTab = function (tab) {
        document.querySelectorAll('.icf-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.icf-tab-panel').forEach(p => p.classList.remove('active'));
        // ai tab is accessed from controls bar, not the tab nav
        const btn   = document.getElementById('tabbtn-' + tab);
        const panel = document.getElementById('tab-panel-' + tab);
        if (btn)   btn.classList.add('active');
        if (panel) panel.classList.add('active');
        if (tab === 'analysis') { initAnalysisFilters(); runAnalysis(); }
        if (tab === 'ai')       { renderSamples(); icfAiRefreshStats(); }
    };

    // ── Override openAnalysisModal → switches to analysis tab ─
    window.openAnalysisModal = function () { window.switchTab('analysis'); };
    window.closeAnalysisModal = function () { destroyCharts(); };

    
        const modal=document.getElementById('analysisModal');
        if(!modal)return;

        // Populate district dropdown
        const dd=document.getElementById('af_district');
        if(dd){
            dd.innerHTML='<option value="">All Districts</option>';
            const loc=getLoc();
            Object.keys(loc).sort().forEach(d=>{const o=document.createElement('option');o.value=o.textContent=d;dd.appendChild(o);});
        }

        // Reset dependent dropdowns
        ['af_chiefdom','af_section','af_facility','af_community','af_school'].forEach(id=>{
            const el=document.getElementById(id);if(el){el.innerHTML='<option value="">All</option>';el.disabled=true;}
        });

    // ── Populate district filter on first open ─────────────
    function initAnalysisFilters(){
        const dd=document.getElementById('af_district');
        if(!dd||dd.options.length>1)return;
        const loc=getLoc();
        Object.keys(loc).sort().forEach(d=>{const o=document.createElement('option');o.value=o.textContent=d;dd.appendChild(o);});
    }

    console.log('[ICF AI Agent] Loaded ✓');
})();
