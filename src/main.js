// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import JavaScriptu
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { createClient } from '@supabase/supabase-js'

import _ from 'lodash';


//----------- Připojení databaze ------------
const supabaseUrl = 'https://oeduerzkrrxfyllzugvr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZHVlcnprcnJ4ZnlsbHp1Z3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTY2MzgsImV4cCI6MjA1MTU3MjYzOH0.tYXbEKWiyTE8PHLypqg1wXsXWUuvXQIbepa5ezBG-bU'
const supabase = createClient(supabaseUrl, supabaseKey)


//------------ Zachycení html prvků -----------------
const form = document.querySelector('form');
const tournamentInfo = document.querySelector('#tournamentInfo')
const teamsList = document.querySelector('#teamsList');
const header = document.querySelector('#header');
const buttonsForTournament = document.querySelector('#buttonsForTournament');


//------------ Výpis tabulek --------------------------
async function fetchTeams() {
  let { data: teams, error } = await supabase
    .from('teams')
    .select(`
    *,
    groups (
      id,
      name
    )
  `);

  if (error) {
    console.error('Chyba při načítání týmů:', error.message);
  } else {
    console.log('Načtené týmy:', teams);
  }

  if (teams.length !== 0) {
    // Tlačítka pro načíst turnaj z db nebo vytvořit nový turnaj, pokud db obsahuje nějaká data 
    buttonsForTournament.classList.remove('hidden')
  } else {
    buttonsForTournament.classList.add('hidden')
  }

  // Pokud jsou týmy prázdné, vrátíme prázdné pole, což je bezpečné pro následující kód
  if (!teams || teams.length === 0) {
    console.log('Žádné týmy nejsou v databázi.');
    return [];  // Vrátí prázdné pole, pokud nejsou žádné týmy
  }

  return teams
}

fetchTeams();

//------------ Objekt pro uložení dat z formuláře -----------------
let dataFromForm = {};

//------------ Formulář --------------------------
form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  //  Uložení dat z formuláře do objektu
  dataFromForm = {
    nameOfTournament: formData.get('nameOfTournament').trim(),
    placeOfTournament: formData.get('placeOfTournament').trim(),
    dateOfTournament: formData.get('dateOfTournament'),
    timeOfTournament: formData.get('timeOfTournament'),
    numberOfParticipants: parseInt(formData.get('numberOfParticipants')),
    numberOfGroups: parseInt(formData.get('numberOfGroups')),
  }
  // Validace
  if (!dataFromForm.nameOfTournament || dataFromForm.nameOfTournament.length < 3) {
    alert('Název turnaje musí mít alespoň 3 znaky.');
    return;
  }

  if (dataFromForm.placeOfTournament === '') {
    alert('Místo konání nesmí být prázdné.');
    return;
  }

  if (!dataFromForm.dateOfTournament) {
    alert('Datum konání je povinné.');
    return;
  }

  if (!dataFromForm.timeOfTournament) {
    alert('Čas konání je povinný.');
    return;
  }

  if (isNaN(dataFromForm.numberOfParticipants) || dataFromForm.numberOfParticipants <= 0) {
    alert('Počet účastníků musí být kladné číslo.');
    return;
  }

  if (isNaN(dataFromForm.numberOfGroups) || dataFromForm.numberOfGroups <= 0) {
    alert('Počet skupin musí být kladné číslo.');
    return;
  }

  // Pokud jsou všechna data validní
  console.log(dataFromForm);

  // Vyčištění formuláře
  form.reset();

  // Odeslání objektu mimo funkci 
  catchDataFromForm(dataFromForm)

  // Odstranění class hidden a zobrazení hlavičky uloženého turnaje
  tournamentInfo.classList.remove('hidden');

})


//------------------- Funkce pro zpracování dat z formuláře ------------

function catchDataFromForm(data) {
  form.classList.add('hidden');

  // Výpočet počtu týmů ve skupinách
  let baseNumberOfParticipantsInGroup = Math.floor(data.numberOfParticipants / data.numberOfGroups);
  let extraTeams = data.numberOfParticipants % data.numberOfGroups;

  // Vytvoření seznamu účastníků
  if (tournamentInfo) {
    tournamentInfo.innerHTML = `
    <h3>${data.nameOfTournament}</h3>
    <p>Místo: ${data.placeOfTournament}</p>
    <p>Datum: ${data.dateOfTournament}</p>
    <p>Čas turnaje: ${data.timeOfTournament}</p>
    `;
  }

  if (teamsList) {
    teamsList.innerHTML = "";
    let count = 1
    for (let i = 1; i <= data.numberOfGroups; i++) {

      // Urči počet týmů pro aktuální skupinu
      let numberOfParticipantsInThisGroup = baseNumberOfParticipantsInGroup;
      if (i <= extraTeams) {
        numberOfParticipantsInThisGroup += 1; // Přidej extra tým první skupině
      }

      // Pro každou skupinu vytvoř nový <ul> a nadpis
      const newUl = document.createElement('ul');
      newUl.id = `group-${i}`;
      const groupHeader = document.createElement('h4');
      groupHeader.textContent = `Skupina ${i}`;
      newUl.appendChild(groupHeader);

      // Přidání účastníků do skupiny
      for (let j = 1; j <= numberOfParticipantsInThisGroup; j++) {
        const newLi = document.createElement('li');
        newLi.innerHTML = `<input type="text" id="teamName-${count}" placeholder="Účastník ${count}">`;
        newUl.appendChild(newLi);
        count++
      }
      // Přidání seznamu skupiny do hlavního kontejneru
      teamsList.appendChild(newUl);
    }


    // Přidání tlačítka pro přesměrování na předchozí stránku
    const backButton = document.createElement('button');
    backButton.classList.add('btn', 'btn-primary', 'p-2', 'm-2');
    backButton.textContent = 'Zpět';
    backButton.addEventListener('click', () => {
      form.classList.remove('hidden');
      tournamentInfo.classList.add('hidden')
      teamsList.innerHTML = "";
    });
    teamsList.appendChild(backButton);

    // Přidání tlačítka pro odeslání týmů do databaze 
    const submitButton = document.createElement('button');
    submitButton.classList.add('btn', 'btn-primary', 'p-2', 'm-2');
    submitButton.textContent = 'Odeslat týmy';
    submitButton.id = 'submitTeamsList';
    teamsList.appendChild(submitButton);

    // Odeslání týmů do databaze 
    submitButton.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        const teamsData = [];

        // Načtení dat týmů z formuláře
        for (let i = 1; i <= dataFromForm.numberOfParticipants; i++) {
          const teamInput = document.getElementById(`teamName-${i}`);
          const team_id = teamInput.id.split('-')[1];
          if (teamInput && teamInput.value.trim()) {
            const groupId = document.querySelector(`#teamName-${i}`).closest('ul').id;
            const group_id = groupId.split('-')[1]

            teamsData.push({
              name: teamInput.value.trim(),
              // Vazba na turnaj
              team_id: parseInt(team_id, 10),
              group_id: parseInt(group_id, 10),

            });
            console.log(teamsData);
          }
        }

        console.log('Odesílaná data týmů:', teamsData);

        // Kontrola, zda máme nějaká data k odeslání
        if (teamsData.length === 0) {
          alert('Žádné týmy k odeslání.');
          return;
        }

        // 🧹 1. Vyčištění tabulky
        const { error: deleteError } = await supabase
          .from('teams')
          .delete()
          .neq('id', 0); // Odstraní všechny záznamy (id != 0 je bezpečná podmínka)

        if (deleteError) {
          console.error('Chyba při mazání tabulky:', deleteError.message);
          alert(`Chyba při mazání tabulky: ${deleteError.message}`);
          return;
        }

        console.log('Tabulka byla úspěšně vyčištěna.');

        // Hromadné odesílání dat do Supabase
        const { data, error } = await supabase
          .from('teams')
          .insert(teamsData)
          .select();
        if (error) {
          console.error('Chyba při odesílání týmů:', error.message);
          alert(`Chyba při odesílání týmů: ${error.message}`);
        } else {
          console.log('Týmy úspěšně uloženy:', data);
        }
      } catch (error) {
        console.error('Neočekávaná chyba při odesílání týmů:', error.message);
        alert(`Neočekávaná chyba: ${error.message}`);
      }
    });


  }
}

// ------------ Načtení týmů z db ------------

const buttonUploadTournament = document.querySelector('#buttonUploadTournament');
buttonUploadTournament.addEventListener('click', async () => {

  try {
    // Skrytí formuláře
    form.classList.add('hidden');

    const teams = await fetchTeams();
    // Použití lodash pro seskupení týmů podle skupin
    const groupedTeams = _.groupBy(teams, (team) => team.groups.name);

    console.log(groupedTeams);

    // Generování seznamu
    const teamsListContainer = document.getElementById('teamsList');
    teamsListContainer.innerHTML = '';

    // Vytvoření tlačítek UPRAVIT a POKRAČOVAT
    const btnGroupDiv = document.createElement('div');
    btnGroupDiv.id = 'btnGroupDiv';
    btnGroupDiv.style.display = 'flex';
    btnGroupDiv.style.justifyContent = 'center';
    btnGroupDiv.style.gap = '10px'

    const btnUpdate = document.createElement('button');
    btnUpdate.classList.add('btn', 'btn-primary', 'p-2', 'col-2', 'text-center');
    btnUpdate.textContent = 'UPRAVIT';
    btnUpdate.addEventListener('click', () => {
      const btnUpdateTeams = document.querySelectorAll(".btn-update-teams");
      btnUpdateTeams.forEach((element) => element.classList.remove("hidden"));
    });

    const btnContinue = document.createElement('button');
    btnContinue.classList.add('btn', 'btn-primary', 'p-2', 'col-2', 'text-center')
    btnContinue.textContent = 'POKRAČOVAT'
    btnContinue.addEventListener('click', () => {
      console.log("Jít na další stránku");
    });

    btnGroupDiv.appendChild(btnUpdate);
    btnGroupDiv.appendChild(btnContinue);
    

    // Vytvoření skupin
    Object.entries(groupedTeams).forEach(([groupName, teams]) => {
      const groupUl = document.createElement('ul');
      groupUl.classList.add('list-group', 'w-50', 'mx-auto', 'container');
      groupUl.innerHTML = `<strong>${groupName}</strong>`;


      // Načtení týmů do jednotlivých skupin a přidání tlačítek
      teams.forEach((team) => {
        const teamLi = document.createElement('li');
        teamLi.classList.add('list-group-item')
        teamLi.innerHTML = `
        <div class="row align-items-center">
          <div class="col-7">
            <input type="text" class="form-control py-6 px-0" value="${team.name}">
          </div>

          <div class="btn-update-teams col-5 text-end hidden p-0"> 
          <div class="d-flex align-items-center gap-10">
            <div class="col-6 p-0"> <!-- Nastavení stejné šířky pro select a button -->
          <select class="form-select w-100"> <!-- Full width pro select -->
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>

        <div class="col-6 p-0"> <!-- Tlačítko má stejné rozměry -->
          <button type="button" id="${team.id}" class="btn btn-danger btn_delete w-100">X</button>
        </div>
          </div>
          </div>
        </div>
      `

        // Odstanění týmu z turnaje i z databáze
        const btnDelete = teamLi.querySelector('.btn_delete');
        btnDelete.addEventListener('click', async (event) => {
          event.preventDefault();
          console.log(event.target);
          const teamId = parseInt(event.target.id, 10);
          const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId);

          if (error) {
            console.error('Chyba při mazání týmu:', error.message);
            alert(`Chyba při mazání týmu: ${error.message}`);
            return;
          }

          console.log(`Tým s ID ${teamId} byl úspěšně odstraněn.`);
          // Odebereme tým z seznamu
          teamLi.remove();
        });

        // Přidání týmu do turnaje


        groupUl.appendChild(teamLi);

      });


      teamsListContainer.appendChild(groupUl);
    });

    teamsListContainer.appendChild(btnGroupDiv)

    console.log('✅ Úspěšně načtené týmy:', teams);

    // Zobrazíme týmy na stránce

  } catch (error) {
    console.error('🚨 Chyba při zpracování týmů:', error.message);
    alert(`Chyba při načítání týmů: ${error.message}`);
  }
});

//-------------- Tlačítko vytvořit nový turnaj ----------------
const buttonCreateNewTournament = document.querySelector('#buttonCreateNewTournament');
buttonCreateNewTournament.addEventListener('click', () => {
  form.classList.remove('hidden');
  tournamentInfo.classList.add('hidden');
  teamsList.innerHTML = "";
});
