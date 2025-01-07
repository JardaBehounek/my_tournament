
import { createClient } from '@supabase/supabase-js'


//----------- Připojení databaze ------------
const supabaseUrl = 'https://oeduerzkrrxfyllzugvr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZHVlcnprcnJ4ZnlsbHp1Z3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTY2MzgsImV4cCI6MjA1MTU3MjYzOH0.tYXbEKWiyTE8PHLypqg1wXsXWUuvXQIbepa5ezBG-bU'
const supabase = createClient(supabaseUrl, supabaseKey)


//------------ Výpis tabulek --------------------------
async function fetchTeams() {
  let { data: teams, error } = await supabase
    .from('teams')
    .select('*');

  if (error) {
    console.error('Chyba při načítání týmů:', error.message);
  } else {
    console.log('Načtené týmy:', teams);
  }
}

fetchTeams();


const form = document.querySelector('form');
const tables = document.querySelector('#tables')
const teamsList = document.querySelector('#teamsList');
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
  alert('Formulář byl úspěšně odeslán!');

  // Vyčištění formuláře
  form.reset();

  // Odeslání objektu mimo funkci 
  handleFormData(dataFromForm)

})


//------------------- Funkce pro zpracování dat z formuláře ------------

function handleFormData(data) {
  form.classList.add('hidden');

  // Výpočet počtu týmů ve skupinách
  let baseNumberOfParticipantsInGroup = Math.floor(data.numberOfParticipants / data.numberOfGroups);
  let extraTeams = data.numberOfParticipants % data.numberOfGroups;

  // Vytvoření seznamu účastníků
  if (tables) {
    tables.innerHTML = `
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
      const groupHeader = document.createElement('h4');
      groupHeader.textContent = `Skupina ${i}`;
      newUl.appendChild(groupHeader);

      // Přidání účastníků do skupiny
      for (let j = 1; j <= numberOfParticipantsInThisGroup; j++) {
        const newLi = document.createElement('li');
        newLi.innerHTML = `<input type="text" id="teamName${count}" placeholder="Účastník ${count}">`;
        newUl.appendChild(newLi);
        count++
      }
      // Přidání seznamu skupiny do hlavního kontejneru
      teamsList.appendChild(newUl);
    }


    // Přidání tlačítka pro přesměrování na předchozí stránku
    const newButton = document.createElement('button');
    newButton.textContent = 'Zpět';
    teamsList.appendChild(newButton);
    newButton.addEventListener('click', () => {
      form.classList.remove('hidden');
      teamsList.innerHTML = "";
    });

    // Přidání tlačítka pro odeslání týmů do databaze 
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Odeslat týmy';
    submitButton.id = 'submitTeamsList';
    teamsList.appendChild(submitButton);

    submitButton.addEventListener('click', async (event) => {
      event.preventDefault();
    
      try {
        const teamsData = [];
    
        // Načtení dat týmů z formuláře
        for (let i = 1; i <= dataFromForm.numberOfParticipants; i++) {
          const teamInput = document.getElementById(`teamName${i}`);
          if (teamInput && teamInput.value.trim()) {
            teamsData.push({
              name: teamInput.value.trim(),
              teams_id_in_tournament: teamInput.id // Příklad vazby na turnaj
            });
          }
        }
    
        console.log('Odesílaná data týmů:', teamsData);
    
        // Kontrola, zda máme nějaká data k odeslání
        if (teamsData.length === 0) {
          alert('Žádné týmy k odeslání.');
          return;
        }
    
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
          alert('Všechny týmy byly úspěšně odeslány!');
        }
      } catch (error) {
        console.error('Neočekávaná chyba při odesílání týmů:', error.message);
        alert(`Neočekávaná chyba: ${error.message}`);
      }
    });
    

  }
}
