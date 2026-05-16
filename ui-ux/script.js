const today = '2026-05-01';
const app = document.querySelector('#app');

const users = [
  { id: 's1', role: 'student', name: 'Maya Patel', email: 'maya.patel@student.ac.uk', supervisorId: 'ps1' },
  { id: 's2', role: 'student', name: 'Oliver Hughes', email: 'oliver.hughes@student.ac.uk', supervisorId: 'ps1' },
  { id: 's3', role: 'student', name: 'Amelia Carter', email: 'amelia.carter@student.ac.uk', supervisorId: 'ps1' },
  { id: 's4', role: 'student', name: 'Daniel Morgan', email: 'daniel.morgan@student.ac.uk', supervisorId: 'ps2' },
  { id: 's5', role: 'student', name: 'Sofia Bennett', email: 'sofia.bennett@student.ac.uk', supervisorId: 'ps2' },
  { id: 's6', role: 'student', name: 'Nathan Brooks', email: 'nathan.brooks@student.ac.uk', supervisorId: 'ps2' },

  { id: 'ps1', role: 'supervisor', name: 'Dr Helen Fraser', email: 'helen.fraser@staff.ac.uk' },
  { id: 'ps2', role: 'supervisor', name: 'Dr Marcus Reid', email: 'marcus.reid@staff.ac.uk' },

  { id: 'st1', role: 'seniorTutor', name: 'Prof Eleanor Shaw', email: 'eleanor.shaw@staff.ac.uk' }
];

let checkIns = [
  { studentId: 's1', date: '2026-05-01', mood: 4, anxiety: 2, engagement: 85, support: false, note: 'Feeling positive this week.' },
  { studentId: 's1', date: '2026-04-24', mood: 3, anxiety: 3, engagement: 78, support: false, note: '' },

  { studentId: 's2', date: '2026-04-30', mood: 2, anxiety: 5, engagement: 45, support: true, note: 'Coursework pressure is affecting sleep.' },
  { studentId: 's2', date: '2026-04-23', mood: 2, anxiety: 4, engagement: 51, support: false, note: '' },

  { studentId: 's3', date: '2026-04-29', mood: 5, anxiety: 1, engagement: 91, support: false, note: 'No concerns.' },

  { studentId: 's4', date: '2026-04-27', mood: 3, anxiety: 2, engagement: 65, support: false, note: '' },

  { studentId: 's5', date: '2026-05-01', mood: 1, anxiety: 5, engagement: 22, support: true, note: 'Feeling isolated and overwhelmed.' },
  { studentId: 's5', date: '2026-04-24', mood: 2, anxiety: 5, engagement: 28, support: true, note: '' },

  { studentId: 's6', date: '2026-04-28', mood: 4, anxiety: 2, engagement: 80, support: false, note: '' }
];

let meetings = [
  { studentId: 's1', supervisorId: 'ps1', date: '2026-05-06', time: '10:00', status: 'scheduled', requestedBy: 'supervisor', reason: 'Project progress review' },
  { studentId: 's2', supervisorId: 'ps1', date: '2026-05-02', time: '14:00', status: 'scheduled', requestedBy: 'student', reason: 'Wellbeing support' },
  { studentId: 's5', supervisorId: 'ps2', date: '2026-05-03', time: '09:00', status: 'scheduled', requestedBy: 'supervisor', reason: 'Urgent wellbeing check' },
  { studentId: 's3', supervisorId: 'ps1', date: '2026-04-25', time: '11:00', status: 'completed', requestedBy: 'supervisor', reason: 'Academic progress' }
];

let currentUser = null;
let message = '';

const roleNames = {
  student: 'Student',
  supervisor: 'Personal Supervisor',
  seniorTutor: 'Senior Tutor'
};

const sliderColours = {
  good: '#166534',
  medium: '#92400e',
  low: '#991b1b',
  track: '#e5e7eb'
};

function students() {
  return users.filter(user => user.role === 'student');
}

function supervisors() {
  return users.filter(user => user.role === 'supervisor');
}

function findUser(id) {
  return users.find(user => user.id === id);
}

function supervisorFor(student) {
  return findUser(student.supervisorId);
}

function checkInsFor(studentId) {
  return checkIns
    .filter(item => item.studentId === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function latestCheckIn(studentId) {
  return checkInsFor(studentId)[0];
}

function meetingsForStudent(studentId) {
  return meetings.filter(meeting => meeting.studentId === studentId);
}

function scheduledMeetingsForStudent(studentId) {
  return meetingsForStudent(studentId)
    .filter(meeting => meeting.status === 'scheduled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
}

function studentsForSupervisor(supervisorId) {
  return students().filter(student => student.supervisorId === supervisorId);
}

function daysSince(date) {
  return Math.floor((new Date(today) - new Date(date)) / 86400000);
}

function riskLevel(student) {
  const latest = latestCheckIn(student.id);

  if (!latest) {
    return { text: 'No data', className: 'medium' };
  }

  if (
    latest.support ||
    latest.mood <= 2 ||
    latest.anxiety >= 4 ||
    latest.engagement < 40
  ) {
    return { text: 'High support need', className: 'low' };
  }

  if (
    daysSince(latest.date) > 7 ||
    latest.mood === 3 ||
    latest.engagement < 65
  ) {
    return { text: 'Monitor', className: 'medium' };
  }

  return { text: 'Stable', className: 'good' };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function badge(text, className = 'info') {
  return `<span class="badge ${className}">${escapeHtml(text)}</span>`;
}

function stat(value, label) {
  return `
    <div class="card stat">
      <strong>${value}</strong>
      <span class="muted small">${label}</span>
    </div>
  `;
}

function page(title, subtitle, content) {
  app.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <div>
          <h1>${escapeHtml(title)}</h1>
          <p class="muted">${escapeHtml(subtitle)}</p>
        </div>
        <button class="btn" data-action="logout">Log out</button>
      </div>
    </header>

    <main class="main">
      <div class="container stack">
        ${message ? `<div class="success-message">${escapeHtml(message)}</div>` : ''}
        ${content}
      </div>
    </main>
  `;
}

function render() {
  message = '';

  if (!currentUser) {
    renderLogin();
    return;
  }

  if (currentUser.role === 'student') {
    renderStudentDashboard();
  }

  if (currentUser.role === 'supervisor') {
    renderSupervisorDashboard();
  }

  if (currentUser.role === 'seniorTutor') {
    renderSeniorTutorDashboard();
  }
}

function renderLogin() {
  const quickAccessUsers = [
    students()[0],
    students()[1],
    supervisors()[0],
    users.find(user => user.role === 'seniorTutor')
  ];

  app.innerHTML = `
    <main class="login-screen">
      <section class="login-card stack">
        <div class="center">
          <h1>Student Engagement Monitoring System</h1>
          <p class="muted">Student wellbeing and engagement portal</p>
        </div>

        <div class="card stack">
          <h2>Login</h2>

          <form id="loginForm" class="stack">
            <div>
              <label for="email">University email</label>
              <input id="email" type="email" placeholder="maya.patel@student.ac.uk" required />
            </div>

            <div>
              <label for="password">Password</label>
              <input id="password" type="password" placeholder="Enter your password" required />
            </div>

            <div id="loginError" class="error hidden">
              No matching account was found.
            </div>

            <button class="btn btn-primary btn-full">Login</button>
          </form>
        </div>

        <div class="card stack">
          <h3>Quick access</h3>

          ${quickAccessUsers.map(user => `
            <button class="btn btn-full" data-login="${user.id}">
              ${escapeHtml(user.name)} - ${roleNames[user.role]}
            </button>
          `).join('')}
        </div>
      </section>
    </main>
  `;

  document.querySelector('#loginForm').addEventListener('submit', event => {
    event.preventDefault();

    const email = document.querySelector('#email').value.trim().toLowerCase();
    const user = users.find(item => item.email.toLowerCase() === email);

    if (!user) {
      document.querySelector('#loginError').classList.remove('hidden');
      return;
    }

    currentUser = user;
    render();
  });
}

function renderStudentDashboard() {
  const latest = latestCheckIn(currentUser.id);
  const supervisor = supervisorFor(currentUser);
  const risk = riskLevel(currentUser);
  const studentMeetings = meetingsForStudent(currentUser.id);
  const scheduledMeetings = scheduledMeetingsForStudent(currentUser.id);
  const nextMeeting = scheduledMeetings[0];

  page(
    `Welcome, ${currentUser.name}`,
    `Personal Supervisor: ${supervisor.name}`,
    `
      <section class="grid grid-3">
        ${stat(latest ? `${latest.mood}/5` : 'N/A', 'Latest mood score')}
        ${stat(latest ? `${latest.anxiety}/5` : 'N/A', 'Latest anxiety score')}
        ${stat(latest ? `${latest.engagement}%` : 'N/A', 'Engagement estimate')}
      </section>

      ${
        nextMeeting
          ? `
            <section class="alert info-alert">
              <strong>Upcoming meeting:</strong>
              You have a scheduled meeting with ${escapeHtml(supervisor.name)}
              on ${formatDate(nextMeeting.date)} at ${escapeHtml(nextMeeting.time)}.
              <span class="small">Reason: ${escapeHtml(nextMeeting.reason || 'Not specified')}</span>
            </section>
          `
          : ''
      }

      <section class="grid grid-2">
        <div class="card stack">
          <div class="row">
            <h2>Weekly wellbeing check-in</h2>
            ${badge(risk.text, risk.className)}
          </div>

          <p class="muted small">
            Complete your weekly check-in to help your personal supervisor understand
            how you are progressing and whether any support may be useful.
          </p>

          <form id="checkInForm" class="stack">
            <div>
              <label for="mood">
                Mood:
                <span id="moodValue">4</span>/5
              </label>
              <input id="mood" type="range" min="1" max="5" value="4" data-slider-type="positive" required />
              <p class="muted small">1 = very low, 5 = excellent</p>
            </div>

            <div>
              <label for="anxiety">
                Anxiety:
                <span id="anxietyValue">2</span>/5
              </label>
              <input id="anxiety" type="range" min="1" max="5" value="2" data-slider-type="negative" required />
              <p class="muted small">1 = very low, 5 = very high</p>
            </div>

            <div>
              <label for="engagement">
                Engagement:
                <span id="engagementValue">70</span>%
              </label>
              <input id="engagement" type="range" min="0" max="100" value="70" data-slider-type="positive" required />
              <p class="muted small">Estimate your current academic engagement.</p>
            </div>

            <label class="checkbox">
              <input id="support" type="checkbox" />
              I would like my supervisor to contact me
            </label>

            <div>
              <label for="note">Optional note</label>
              <textarea
                id="note"
                placeholder="For example: workload, attendance, isolation, financial worry, confidence, health..."
              ></textarea>
            </div>

            <button class="btn btn-primary">Submit check-in</button>
          </form>
        </div>

        <div class="card stack">
          <h2>Book a meeting with your PS</h2>

          <form id="meetingForm" class="stack">
            <input type="hidden" id="meetingStudent" value="${currentUser.id}" />

            <div class="grid grid-2">
              <div>
                <label for="meetingDate">Date</label>
                <input id="meetingDate" type="date" required />
              </div>

              <div>
                <label for="meetingTime">Time</label>
                <input id="meetingTime" type="time" required />
              </div>
            </div>

            <div>
              <label for="meetingReason">Reason</label>
              <textarea
                id="meetingReason"
                placeholder="Academic progress, mental health, attendance, module concerns..."
              ></textarea>
            </div>

            <button class="btn btn-primary">Request meeting</button>
          </form>
        </div>
      </section>

      <section class="card">
        <h2>Your meetings</h2>
        ${meetingTable(studentMeetings)}
      </section>

      <section class="card">
        <h2>Check-in history</h2>
        ${checkInTable(checkInsFor(currentUser.id))}
      </section>
    `
  );

  setupSliders();

  document.querySelector('#checkInForm').addEventListener('submit', submitCheckIn);
  document.querySelector('#meetingForm').addEventListener('submit', submitMeetingRequest);
}

function setupSliders() {
  const sliders = [
    { inputId: 'mood', outputId: 'moodValue' },
    { inputId: 'anxiety', outputId: 'anxietyValue' },
    { inputId: 'engagement', outputId: 'engagementValue' }
  ];

  sliders.forEach(slider => {
    const input = document.querySelector(`#${slider.inputId}`);
    const output = document.querySelector(`#${slider.outputId}`);

    if (!input || !output) {
      return;
    }

    updateSliderDisplay(input, output);

    input.addEventListener('input', () => {
      updateSliderDisplay(input, output);
    });
  });
}

function updateSliderDisplay(input, output) {
  output.textContent = input.value;
  updateSliderColour(input);
}

function updateSliderColour(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percentage = ((value - min) / (max - min)) * 100;
  const sliderType = input.dataset.sliderType;

  let activeColour = sliderColours.medium;

  if (sliderType === 'negative') {
    if (percentage <= 33) {
      activeColour = sliderColours.good;
    } else if (percentage <= 66) {
      activeColour = sliderColours.medium;
    } else {
      activeColour = sliderColours.low;
    }
  } else {
    if (percentage <= 33) {
      activeColour = sliderColours.low;
    } else if (percentage <= 66) {
      activeColour = sliderColours.medium;
    } else {
      activeColour = sliderColours.good;
    }
  }

  input.style.background = `linear-gradient(
    to right,
    ${activeColour} 0%,
    ${activeColour} ${percentage}%,
    ${sliderColours.track} ${percentage}%,
    ${sliderColours.track} 100%
  )`;
}

function renderSupervisorDashboard() {
  const assignedStudents = studentsForSupervisor(currentUser.id);
  const highRisk = assignedStudents.filter(student => riskLevel(student).className === 'low').length;
  const scheduled = meetings.filter(meeting =>
    meeting.supervisorId === currentUser.id &&
    meeting.status === 'scheduled'
  ).length;

  page(
    'Personal Supervisor Dashboard',
    `${currentUser.name} - ${assignedStudents.length} assigned students`,
    `
      <section class="grid grid-3">
        ${stat(assignedStudents.length, 'Assigned students')}
        ${stat(highRisk, 'High support need')}
        ${stat(scheduled, 'Scheduled meetings')}
      </section>

      ${
        highRisk
          ? `<section class="alert"><strong>Action required:</strong> one or more students have wellbeing indicators suggesting they may need support.</section>`
          : ''
      }

      <section class="card stack">
        <h2>Student overview</h2>
        ${assignedStudents.map(studentCard).join('')}
      </section>

      <section class="card">
        <h2>Supervisor meeting log</h2>
        ${meetingTable(meetings.filter(meeting => meeting.supervisorId === currentUser.id))}
      </section>
    `
  );
}

function renderSeniorTutorDashboard() {
  const allStudents = students();
  const highRisk = allStudents.filter(student => riskLevel(student).className === 'low').length;
  const totalScheduled = meetings.filter(meeting => meeting.status === 'scheduled').length;
  const completed = meetings.filter(meeting => meeting.status === 'completed').length;

  page(
    'Senior Tutor Dashboard',
    'Whole-school view of student wellbeing, engagement and supervisor activity',
    `
      <section class="grid grid-4">
        ${stat(allStudents.length, 'Total students')}
        ${stat(highRisk, 'High support need')}
        ${stat(totalScheduled, 'Scheduled meetings')}
        ${stat(completed, 'Completed meetings')}
      </section>

      <section class="grid grid-2">
        <div class="card">
          <h2>Students needing attention</h2>
          ${studentStatusTable(allStudents.filter(student => riskLevel(student).className !== 'good'))}
        </div>

        <div class="card">
          <h2>Supervisor activity</h2>
          ${supervisorActivityTable()}
        </div>
      </section>

      <section class="card">
        <h2>All student statuses</h2>
        ${studentStatusTable(allStudents)}
      </section>
    `
  );
}

function studentCard(student) {
  const latest = latestCheckIn(student.id);
  const risk = riskLevel(student);
  const meetingsCount = scheduledMeetingsForStudent(student.id).length;

  return `
    <article class="student-card">
      <div>
        <div class="row">
          <h3>${escapeHtml(student.name)}</h3>
          ${badge(risk.text, risk.className)}
        </div>

        <p class="muted small">${escapeHtml(student.email)}</p>

        <p class="small">
          Latest:
          ${
            latest
              ? `${formatDate(latest.date)} - mood ${latest.mood}/5, anxiety ${latest.anxiety}/5, engagement ${latest.engagement}%`
              : 'No check-in submitted'
          }
        </p>

        ${latest?.note ? `<p class="small"><strong>Note:</strong> ${escapeHtml(latest.note)}</p>` : ''}

        <p class="small muted">Scheduled meetings: ${meetingsCount}</p>
      </div>

      <form class="stack quickMeetingForm">
        <input type="hidden" class="studentId" value="${student.id}" />
        <input type="date" class="quickDate" required />
        <input type="time" class="quickTime" required />
        <input type="text" class="quickReason" placeholder="Meeting reason" />
        <button class="btn btn-primary btn-small">Book meeting</button>
      </form>
    </article>
  `;
}

function studentStatusTable(list) {
  if (list.length === 0) {
    return '<p class="muted">No matching students.</p>';
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Supervisor</th>
            <th>Latest check-in</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${list.map(student => {
            const latest = latestCheckIn(student.id);
            const risk = riskLevel(student);

            return `
              <tr>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(supervisorFor(student).name)}</td>
                <td>
                  ${
                    latest
                      ? `${formatDate(latest.date)}<br><span class="muted small">Mood ${latest.mood}/5, anxiety ${latest.anxiety}/5, engagement ${latest.engagement}%</span>`
                      : 'No data'
                  }
                </td>
                <td>${badge(risk.text, risk.className)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function supervisorActivityTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Supervisor</th>
            <th>Students</th>
            <th>Scheduled</th>
            <th>Completed</th>
          </tr>
        </thead>

        <tbody>
          ${supervisors().map(supervisor => `
            <tr>
              <td>${escapeHtml(supervisor.name)}</td>
              <td>${studentsForSupervisor(supervisor.id).length}</td>
              <td>${meetings.filter(meeting =>
                meeting.supervisorId === supervisor.id &&
                meeting.status === 'scheduled'
              ).length}</td>
              <td>${meetings.filter(meeting =>
                meeting.supervisorId === supervisor.id &&
                meeting.status === 'completed'
              ).length}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function meetingTable(list) {
  if (list.length === 0) {
    return '<p class="muted">No meetings recorded.</p>';
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Student</th>
            <th>Supervisor</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          ${list.map(meeting => `
            <tr>
              <td>${formatDate(meeting.date)}</td>
              <td>${escapeHtml(meeting.time)}</td>
              <td>${escapeHtml(findUser(meeting.studentId).name)}</td>
              <td>${escapeHtml(findUser(meeting.supervisorId).name)}</td>
              <td>${badge(meeting.status, meeting.status === 'completed' ? 'good' : 'info')}</td>
              <td>${escapeHtml(meeting.reason || 'Not specified')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function checkInTable(list) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Mood</th>
            <th>Anxiety</th>
            <th>Engagement</th>
            <th>Support requested</th>
            <th>Note</th>
          </tr>
        </thead>

        <tbody>
          ${list.map(item => `
            <tr>
              <td>${formatDate(item.date)}</td>
              <td>${item.mood}/5</td>
              <td>${item.anxiety}/5</td>
              <td>${item.engagement}%</td>
              <td>${item.support ? 'Yes' : 'No'}</td>
              <td>${escapeHtml(item.note || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function submitCheckIn(event) {
  event.preventDefault();

  checkIns.unshift({
    studentId: currentUser.id,
    date: today,
    mood: Number(document.querySelector('#mood').value),
    anxiety: Number(document.querySelector('#anxiety').value),
    engagement: Number(document.querySelector('#engagement').value),
    support: document.querySelector('#support').checked,
    note: document.querySelector('#note').value.trim()
  });

  message = 'Your wellbeing check-in has been recorded and your dashboard has been updated.';
  renderStudentDashboard();
}

function submitMeetingRequest(event) {
  event.preventDefault();

  const studentId = document.querySelector('#meetingStudent')?.value || currentUser.id;
  const student = findUser(studentId);

  meetings.unshift({
    studentId,
    supervisorId: student.supervisorId,
    date: document.querySelector('#meetingDate').value,
    time: document.querySelector('#meetingTime').value,
    status: 'scheduled',
    requestedBy: currentUser.role,
    reason: document.querySelector('#meetingReason').value.trim()
  });

  message = 'Your meeting request has been added to your meetings table.';
  renderStudentDashboard();
}

function submitQuickMeeting(form) {
  const studentId = form.querySelector('.studentId').value;
  const student = findUser(studentId);

  meetings.unshift({
    studentId,
    supervisorId: student.supervisorId,
    date: form.querySelector('.quickDate').value,
    time: form.querySelector('.quickTime').value,
    status: 'scheduled',
    requestedBy: 'supervisor',
    reason: form.querySelector('.quickReason').value.trim() || 'Supervisor check-in'
  });

  message = `Meeting booked with ${student.name}.`;
  renderSupervisorDashboard();
}

app.addEventListener('click', event => {
  const loginButton = event.target.closest('[data-login]');
  const logoutButton = event.target.closest('[data-action="logout"]');

  if (loginButton) {
    currentUser = findUser(loginButton.dataset.login);
    render();
  }

  if (logoutButton) {
    currentUser = null;
    render();
  }
});

app.addEventListener('submit', event => {
  const quickForm = event.target.closest('.quickMeetingForm');

  if (quickForm) {
    event.preventDefault();
    submitQuickMeeting(quickForm);
  }
});

render();
