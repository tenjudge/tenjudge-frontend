<script setup lang="ts">
const upcomingContests = [
  {
    name: 'TenJudge Monthly Contest #1',
    startTime: '2025-05-25 20:00',
    duration: '2 hours',
    registered: true,
  },
  {
    name: 'TenJudge Weekly Contest #16',
    startTime: '2025-05-18 20:00',
    duration: '1.5 hours',
    registered: false,
  },
  {
    name: 'Code Sprint 2025 Round 2',
    startTime: '2025-05-22 19:00',
    duration: '3 hours',
    registered: true,
  },
  {
    name: 'Algorithm Arena 2025',
    startTime: '2025-06-01 14:00',
    duration: '4 hours',
    registered: false,
  },
  {
    name: 'University Programming Challenge 2025',
    startTime: '2025-06-07 10:00',
    duration: '5 hours',
    registered: false,
  },
]

const endedContests = [
  {
    name: 'Petrozavodsk Summer 2016. Day 4. Ce Jin and Ruyi J Contest',
    startTime: '2016-06-22 17:00',
    duration: '5 hours',
    rank: '128 / 1024',
  },
  {
    name: 'Nordic Olympiad in Informatics 2026',
    startTime: '2026-03-17 15:00',
    duration: '5 hours',
    rank: '45 / 356',
  },
  {
    name: '2024 KAIST 15th ICPC Mock Competition',
    startTime: '2024-09-07 09:00',
    duration: '5 hours',
    rank: '312 / 2345',
  },
  {
    name: '2018 KAIST 8th ICPC Mock Competition',
    startTime: '2018-08-11 09:00',
    duration: '5 hours',
    rank: '278 / 1789',
  },
  {
    name: 'BCF 2025',
    startTime: '2025-02-15 10:00',
    duration: '24 hours',
    rank: '102 / 856',
  },
  {
    name: 'The 2018 Polish Collegiate Programming Contest (AMPPZ 2018)',
    startTime: '2018-11-10 12:00',
    duration: '5 hours',
    rank: '66 / 640',
  },
  {
    name: 'The 2017 Polish Collegiate Programming Contest (AMPPZ 2017)',
    startTime: '2017-11-11 12:00',
    duration: '5 hours',
    rank: '72 / 598',
  },
  {
    name: 'XXI Open Cup named after E.V. Pankratiev, Grand Prix of Siberia',
    startTime: '2019-09-15 09:00',
    duration: '5 hours',
    rank: '199 / 1432',
  },
]
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="TenJudge home">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m8 7-5 5 5 5" />
          <path d="m16 7 5 5-5 5" />
        </svg>
        <span>TenJudge</span>
      </a>

      <nav class="main-nav" aria-label="Main navigation">
        <a class="active" href="#">Contests</a>
        <a href="#">Problems</a>
        <a href="#">Submissions</a>
        <a href="#">Agent</a>
      </nav>

      <div class="account">
        <button class="user-menu" type="button">
          shaun2005
        </button>
        <a href="#">Logout</a>
      </div>
    </header>

    <main>
      <div class="search-row">
        <form class="search-form" role="search">
          <label class="sr-only" for="contest-search">Search contests</label>
          <input id="contest-search" type="search" placeholder="Search contests..." />
          <button type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
          </button>
        </form>
      </div>

      <section class="contest-section" aria-labelledby="upcoming-title">
        <h1 id="upcoming-title">Current or upcoming contests</h1>
        <div class="table-frame">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Register</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contest in upcomingContests" :key="contest.name">
                <td>{{ contest.name }}</td>
                <td>{{ contest.startTime }}</td>
                <td>{{ contest.duration }}</td>
                <td>
                  <button
                    class="register-link"
                    :class="contest.registered ? 'is-unregister' : 'is-register'"
                    type="button"
                  >
                    {{ contest.registered ? 'Unregister' : 'Register' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="contest-section ended-section" aria-labelledby="ended-title">
        <h2 id="ended-title">Ended contests</h2>
        <div class="table-frame">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Rank</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contest in endedContests" :key="contest.name">
                <td>{{ contest.name }}</td>
                <td>{{ contest.startTime }}</td>
                <td>{{ contest.duration }}</td>
                <td>{{ contest.rank }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <footer>© 2013-2025 <span>TenJudge.</span> All rights reserved.</footer>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  background: #ffffff;
  color: #071228;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

:global(button),
:global(input) {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  padding: 30px 24px 31px;
}

.topbar,
main,
footer {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.topbar {
  display: grid;
  grid-template-columns: 190px 1fr 220px;
  align-items: center;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid #d5dce8;
  border-radius: 10px;
  background: #fff;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  color: #071228;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
}

.brand svg {
  width: 27px;
  height: 27px;
}

svg {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 12px;
  height: 100%;
}

.main-nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: auto;
  height: 48px;
  padding: 0 14px;
  color: #071228;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  text-decoration: none;
}

.main-nav a.active::after {
  position: absolute;
  right: 18px;
  bottom: -1px;
  left: 18px;
  height: 3px;
  background: #06122b;
  content: "";
}

.account {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 22px;
  font-size: 14px;
}

.account a,
.user-menu {
  color: #071228;
  font-weight: 600;
  text-decoration: none;
}

.account a:hover,
.user-menu:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.user-menu {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.user-menu:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

main {
  padding-top: 34px;
}

.search-row {
  display: flex;
  justify-content: flex-end;
}

.search-form {
  display: flex;
  width: 315px;
  height: 42px;
}

.search-form input {
  width: 100%;
  min-width: 0;
  padding: 0 17px;
  border: 1px solid #d7deea;
  border-right: 0;
  border-radius: 5px 0 0 5px;
  color: #071228;
  font-size: 14px;
  outline: none;
}

.search-form input::placeholder {
  color: #6f7a8e;
  opacity: 1;
}

.search-form button {
  border: 0;
  background: #06122b;
  color: #fff;
  cursor: pointer;
}

.search-form button {
  display: inline-grid;
  place-items: center;
  flex: 0 0 50px;
  border-radius: 0 5px 5px 0;
}

.search-form button svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.8;
}

.contest-section {
  margin-top: 7px;
}

.ended-section {
  margin-top: 46px;
}

h1,
h2 {
  margin: 0 0 16px;
  color: #071228;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
}

.table-frame {
  overflow: hidden;
  border: 1px solid #d5dce8;
  border-radius: 4px;
  background: #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  border-right: 1px solid #d5dce8;
  border-bottom: 1px solid #d5dce8;
  vertical-align: middle;
}

th:last-child,
td:last-child {
  border-right: 0;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:nth-child(even) {
  background: #f7f8fa;
}

tbody tr:nth-child(odd) {
  background: #ffffff;
}

th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

td {
  height: 39px;
  padding: 0 24px;
  color: #071228;
  font-size: 14px;
  font-weight: 500;
}

th:first-child,
td:first-child {
  width: 41%;
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  width: 21%;
  text-align: center;
}

th:nth-child(3),
td:nth-child(3) {
  width: 20%;
  text-align: center;
}

th:nth-child(4),
td:nth-child(4) {
  width: 18%;
  text-align: center;
}

.register-link {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.register-link.is-register {
  color: #2563eb;
}

.register-link.is-unregister {
  color: #64748b;
}

footer {
  margin-top: 68px;
  color: #8a94a6;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

footer span {
  color: #071228;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .page-shell {
    padding: 16px;
  }

  .topbar {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .main-nav {
    justify-content: flex-start;
    height: auto;
    overflow-x: auto;
  }

  .main-nav a {
    min-width: auto;
    height: 38px;
    padding: 0 14px;
  }

  .main-nav a.active::after {
    right: 10px;
    left: 10px;
  }

  .account {
    justify-content: flex-start;
  }

  main {
    padding-top: 28px;
  }

  .search-form {
    width: 100%;
  }

  .contest-section {
    margin-top: 28px;
  }

  .table-frame {
    overflow-x: auto;
  }

  table {
    min-width: 820px;
  }
}
</style>
