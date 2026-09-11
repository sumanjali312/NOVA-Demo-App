const app=document.getElementById("app");
const KEY="nova_demo_data_v1";

const seed={
  user:{name:"Demo User",email:"demo@nova.test",role:"Member"},
  projects:[
    {id:1,name:"Website Redesign",description:"Redesign the company website",members:3},
    {id:2,name:"Mobile App",description:"Build the NOVA mobile experience",members:4}
  ],
  tasks:[
    {id:1,title:"Create login page",project:"Website Redesign",assignee:"Demo User",priority:"High",status:"Open",due:"2026-09-15",comments:""},
    {id:2,title:"Prepare dashboard UI",project:"Website Redesign",assignee:"Demo User",priority:"Medium",status:"In Progress",due:"2026-09-12",comments:""},
    {id:3,title:"API requirement review",project:"Mobile App",assignee:"Alex",priority:"Low",status:"Completed",due:"2026-09-08",comments:"Reviewed"},
  ],
  notifications:[
    {id:1,text:"You were assigned: Create login page",read:false},
    {id:2,text:"Project Website Redesign was updated",read:false}
  ]
};

function data(){let d=localStorage.getItem(KEY); if(!d){localStorage.setItem(KEY,JSON.stringify(seed));return structuredClone(seed)} return JSON.parse(d)}
function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
function reset(){localStorage.removeItem(KEY);location.reload()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function today(){return new Date().toISOString().slice(0,10)}
function statusBadge(s){let c=s==="Completed"?"done":s==="In Progress"?"progress":"open";return `<span class="badge ${c}">${esc(s)}</span>`}

function login(){
 app.innerHTML=`<div class="auth"><div class="card">
   <div class="brand">NOVA</div><p class="muted">Team Productivity Platform</p>
   <div id="loginError" class="error"></div>
   <label>Email</label><input id="email" value="demo@nova.test" placeholder="Enter email">
   <label>Password</label><input id="password" type="password" value="password" placeholder="Enter password">
   <button class="primary" style="width:100%;margin-top:18px" onclick="doLogin()">Login</button>
   <p class="muted" style="margin-top:15px">Demo credentials: demo@nova.test / password</p>
   <button class="secondary" style="width:100%" onclick="registerScreen()">Create account</button>
 </div></div>`;
}
function registerScreen(){
 app.innerHTML=`<div class="auth"><div class="card">
   <div class="brand">NOVA</div><h2>Create account</h2><div id="regError" class="error"></div>
   <label>Name</label><input id="rname" placeholder="Your name">
   <label>Email</label><input id="remail" placeholder="you@example.com">
   <label>Password</label><input id="rpass" type="password" placeholder="Minimum 6 characters">
   <button class="primary" style="width:100%;margin-top:18px" onclick="doRegister()">Register</button>
   <button class="secondary" style="width:100%;margin-top:8px" onclick="login()">Back to login</button>
 </div></div>`;
}
function doLogin(){
 const e=document.getElementById("email").value.trim(),p=document.getElementById("password").value;
 if(e!=="demo@nova.test"||p!=="password"){document.getElementById("loginError").textContent="Invalid email or password.";return}
 sessionStorage.setItem("nova_logged","1");location.reload();
}
function doRegister(){
 const n=document.getElementById("rname").value.trim(),e=document.getElementById("remail").value.trim(),p=document.getElementById("rpass").value;
 if(!n||!e||p.length<6){document.getElementById("regError").textContent="Enter name, valid email and password of at least 6 characters.";return}
 const d=data();d.user={name:n,email:e,role:"Member"};save(d);sessionStorage.setItem("nova_logged","1");location.reload();
}
function shell(page){
 const d=data(), unread=d.notifications.filter(n=>!n.read).length;
 app.innerHTML=`<div class="layout"><aside class="sidebar">
  <div class="brand">NOVA</div>
  <div class="nav">
   ${["Dashboard","Projects","Tasks","Notifications","Profile"].map(x=>`<button class="${page===x?"active":""}" onclick="render('${x}')">${x}${x==="Notifications"&&unread?` (${unread})`:""}</button>`).join("")}
   <button onclick="logout()">Logout</button>
  </div>
 </aside><main class="main"><div class="topbar"><div><h1>${page}</h1><div class="muted">Team Productivity Platform</div></div><div class="muted">${esc(d.user.name)}</div></div><div id="content"></div></main></div>`;
}
function render(page="Dashboard"){
 if(page==="Dashboard")dashboard();
 else if(page==="Projects")projects();
 else if(page==="Tasks")tasks();
 else if(page==="Notifications")notifications();
 else profile();
}
function dashboard(){
 shell("Dashboard");const d=data();
 const overdue=d.tasks.filter(t=>t.status!=="Completed"&&t.due<today()).length;
 document.getElementById("content").innerHTML=`<div class="stats">
  <div class="stat">Total Projects<strong>${d.projects.length}</strong></div>
  <div class="stat">Active Projects<strong>${d.projects.length}</strong></div>
  <div class="stat">Open Tasks<strong>${d.tasks.filter(t=>t.status!=="Completed").length}</strong></div>
  <div class="stat">Completed Tasks<strong>${d.tasks.filter(t=>t.status==="Completed").length}</strong></div>
  <div class="stat">Overdue Tasks<strong>${overdue}</strong></div>
 </div>
 <div class="grid2" style="margin-top:18px"><div class="list"><h3>Recent Tasks</h3>${d.tasks.slice(-5).reverse().map(t=>`<div class="row"><span>${esc(t.title)}</span>${statusBadge(t.status)}</div>`).join("")}</div>
 <div class="list"><h3>Notifications</h3>${d.notifications.slice(-5).reverse().map(n=>`<div class="row">${esc(n.text)} ${n.read?"":"<span class='badge overdue'>New</span>"}</div>`).join("")}</div></div>`;
}
function projects(){
 shell("Projects");const d=data();
 document.getElementById("content").innerHTML=`<div class="toolbar"><button class="primary" onclick="projectModal()">+ Create Project</button><input id="psearch" placeholder="Search projects" oninput="projectTable()"></div><div id="projectTable"></div>`;
 projectTable();
}
function projectTable(){
 const d=data(),q=(document.getElementById("psearch")?.value||"").toLowerCase();
 const arr=d.projects.filter(p=>p.name.toLowerCase().includes(q));
 document.getElementById("projectTable").innerHTML=`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Description</th><th>Members</th><th>Actions</th></tr></thead><tbody>${arr.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.description)}</td><td>${p.members}</td><td><button class="secondary" onclick="projectModal(${p.id})">Edit</button> <button class="danger" onclick="deleteProject(${p.id})">Delete</button></td></tr>`).join("")}</tbody></table></div>`;
}
function projectModal(id){
 const d=data(),p=id?d.projects.find(x=>x.id===id):{name:"",description:"",members:1};
 modal(`<h2>${id?"Edit":"Create"} Project</h2><label>Project name</label><input id="mname" value="${esc(p.name)}"><label>Description</label><input id="mdesc" value="${esc(p.description)}"><label>Members</label><input id="mmembers" type="number" min="1" value="${p.members||1}"><div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveProject(${id||0})">Save</button></div>`);
}
function saveProject(id){
 const d=data(),name=document.getElementById("mname").value.trim(),desc=document.getElementById("mdesc").value.trim(),members=Number(document.getElementById("mmembers").value);
 if(!name){alert("Project name is required.");return}
 if(id){Object.assign(d.projects.find(p=>p.id===id),{name,description:desc,members})}
 else d.projects.push({id:Date.now(),name,description:desc,members:members||1});
 save(d);closeModal();projects();
}
function deleteProject(id){
 if(!confirm("Delete this project?"))return;const d=data();d.projects=d.projects.filter(p=>p.id!==id);save(d);projects();
}
function tasks(){
 shell("Tasks");const d=data();
 document.getElementById("content").innerHTML=`<div class="toolbar"><button class="primary" onclick="taskModal()">+ Create Task</button><input id="tsearch" placeholder="Search tasks" oninput="taskTable()"><select id="statusFilter" onchange="taskTable()"><option value="">All Status</option><option>Open</option><option>In Progress</option><option>Completed</option></select><select id="priorityFilter" onchange="taskTable()"><option value="">All Priority</option><option>High</option><option>Medium</option><option>Low</option></select></div><div id="taskTable"></div>`;
 taskTable();
}
function taskTable(){
 const d=data(),q=(document.getElementById("tsearch")?.value||"").toLowerCase(),sf=document.getElementById("statusFilter")?.value||"",pf=document.getElementById("priorityFilter")?.value||"";
 const arr=d.tasks.filter(t=>(t.title.toLowerCase().includes(q)||t.project.toLowerCase().includes(q))&&(!sf||t.status===sf)&&(!pf||t.priority===pf));
 document.getElementById("taskTable").innerHTML=`<div class="table-wrap"><table><thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead><tbody>${arr.map(t=>`<tr><td><b>${esc(t.title)}</b></td><td>${esc(t.project)}</td><td>${esc(t.assignee)}</td><td>${esc(t.priority)}</td><td>${statusBadge(t.status)}</td><td>${esc(t.due)}</td><td><button class="secondary" onclick="taskModal(${t.id})">Edit</button> <button class="danger" onclick="deleteTask(${t.id})">Delete</button></td></tr>`).join("")}</tbody></table></div>`;
}
function taskModal(id){
 const d=data(),t=id?d.tasks.find(x=>x.id===id):{title:"",project:d.projects[0]?.name||"",assignee:d.user.name,priority:"Medium",status:"Open",due:"",comments:""};
 modal(`<h2>${id?"Edit":"Create"} Task</h2><label>Task title</label><input id="mtitle" value="${esc(t.title)}"><label>Project</label><select id="mproject">${d.projects.map(p=>`<option ${p.name===t.project?"selected":""}>${esc(p.name)}</option>`).join("")}</select><label>Assignee</label><input id="massignee" value="${esc(t.assignee)}"><label>Priority</label><select id="mpriority">${["High","Medium","Low"].map(x=>`<option ${x===t.priority?"selected":""}>${x}</option>`).join("")}</select><label>Status</label><select id="mstatus">${["Open","In Progress","Completed"].map(x=>`<option ${x===t.status?"selected":""}>${x}</option>`).join("")}</select><label>Due date</label><input id="mdue" type="date" value="${esc(t.due)}"><label>Comments</label><input id="mcomments" value="${esc(t.comments)}"><div class="modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="primary" onclick="saveTask(${id||0})">Save</button></div>`);
}
function saveTask(id){
 const d=data(),obj={title:document.getElementById("mtitle").value.trim(),project:document.getElementById("mproject").value,assignee:document.getElementById("massignee").value.trim(),priority:document.getElementById("mpriority").value,status:document.getElementById("mstatus").value,due:document.getElementById("mdue").value,comments:document.getElementById("mcomments").value};
 if(!obj.title||!obj.due){alert("Task title and due date are required.");return}
 if(id){Object.assign(d.tasks.find(t=>t.id===id),obj)}else{obj.id=Date.now();d.tasks.push(obj);d.notifications.push({id:Date.now()+1,text:`New task created: ${obj.title}`,read:false})}
 save(d);closeModal();tasks();
}
function deleteTask(id){if(!confirm("Delete this task?"))return;const d=data();d.tasks=d.tasks.filter(t=>t.id!==id);save(d);tasks()}
function notifications(){
 shell("Notifications");const d=data();
 document.getElementById("content").innerHTML=`<div class="toolbar"><button class="primary" onclick="markAllRead()">Mark all as read</button></div><div class="list">${d.notifications.map(n=>`<div class="row"><span>${esc(n.text)}</span>${n.read?"<span class='muted'>Read</span>":"<button class='secondary' onclick='readNotification(${n.id})'>Mark read</button>"}</div>`).join("")}</div>`;
}
function readNotification(id){const d=data(),n=d.notifications.find(x=>x.id===id);if(n)n.read=true;save(d);notifications()}
function markAllRead(){const d=data();d.notifications.forEach(n=>n.read=true);save(d);notifications()}
function profile(){
 shell("Profile");const d=data();
 document.getElementById("content").innerHTML=`<div class="card" style="max-width:600px"><h2>Manage Profile</h2><label>Name</label><input id="pname" value="${esc(d.user.name)}"><label>Email</label><input id="pemail" value="${esc(d.user.email)}"><label>Role</label><input value="${esc(d.user.role)}" disabled><button class="primary" style="margin-top:18px" onclick="saveProfile()">Update Profile</button><hr style="margin:25px 0;border:0;border-top:1px solid #eee"><h3>Demo controls</h3><p class="muted">Reset the demo data before repeating your QA tests.</p><button class="danger" onclick="reset()">Reset Demo Data</button></div>`;
}
function saveProfile(){const d=data();d.user.name=document.getElementById("pname").value.trim()||d.user.name;d.user.email=document.getElementById("pemail").value.trim()||d.user.email;save(d);profile()}
function modal(html){let old=document.getElementById("modal");if(old)old.remove();const el=document.createElement("div");el.id="modal";el.className="modal-bg";el.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(el)}
function closeModal(){document.getElementById("modal")?.remove()}
function logout(){sessionStorage.removeItem("nova_logged");login()}
if(sessionStorage.getItem("nova_logged"))render("Dashboard");else login();
