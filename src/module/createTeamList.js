import { supabase } from "./dbConnection";

export function createListOfTeams(data, tournamentInfo, teamsList) {
  console.log(data, tournamentInfo, 'teamlist:' + teamsList);  
  // Výpočet počtu týmů ve skupinách
  // Mějme na paměti, že tato část kód je v části, kde je vytvářena tabulka s týmy.
  // Pokud se vám to bude hodit, můžete přeložit tento kód do funkce createTeamList.js a přidat příslušné proměnné a vztahy.
  
  // zde se vypočte, kolik týmů bude ve skupině
  // data.numberOfParticipants - zadaný počet týmů ve formuláři
  // data.numberOfGroups - zadaný počet skupin ve formuláři
  // a pak se vypočte počet týmů ve skupině
  // baseNumberOfParticipantsInGroup - počet týmů ve skupině, zaokrouhleno dolů
  let baseNumberOfParticipantsInGroup = Math.floor(data.numberOfParticipants / data.numberOfGroups);
  
  // pomocí modula zjistíme, kolik týmů zbývá po vydělení počtu týmů počtem skupin a uložíme je do proměnné extraTeams
  let extraTeams = data.numberOfParticipants % data.numberOfGroups;
  
  // tournamentInfo - přichycení hlavičky do html stránky v index.html
  // tady se do hlavičky turnaje vypíší zadané info o turnaji (název, místo konání, datum, čas)
  if (tournamentInfo) {
    tournamentInfo.innerHTML = `
    <h3>${data.nameOfTournament}</h3>
    <p>Místo: ${data.placeOfTournament}</p>
    <p>Datum: ${data.dateOfTournament}</p>
    <p>Čas turnaje: ${data.timeOfTournament}</p>
    `;
  }

  // teamsList - přichycení seznamu týmů do html stránky v index.html 
  if (teamsList) {
    teamsList.innerHTML = "";
    
    // proměnná count slouží k číslování účastníků týmů a zajišťuje, že každý tým bude mít jedinečné ID a během iterace se vždy zvýší o 1
    let count = 1;
    
    // Cyklus pro vytvoření skupin
    // Pro každou skupinu se vytvoří seznam (ul) a jeho předmětem je nadpis (h4)
    // V každém seznamu jsou vloženy inputy pro účastníky a jejich id je vytvořeno tak, aby bylo možné je odeslat do API
    // Počet týmů ve skupině je zvolený automaticky tak, aby bylo možné dát počet týmů, který je kladný a jejich počet byl rovnoměrný mezi skupinami
    // Všechny týmy jsou vloženy do hlavičky turnaje a do seznamu týmů
    // Týmy jsou vytvořeny tak, aby byly jedinečné a měly id v číslech od 1 do počtu týmů ve skupině
    // Počet týmů ve skupině je zvolený automaticky tak, aby bylo možné dát počet týmů, který je kladný a jejich počet byl rovnoměrný mezi skupinami
    
    for (let i = 1; i <= data.numberOfGroups; i++) {
      
      // Počet týmů ve skupině pro tento cyklus 
      // Počet týmů ve skupině se mi po každé iteraci nastaví zpět na hodnotu buseNumberOfParticipantsInGroup
      let numberOfParticipantsInThisGroup = baseNumberOfParticipantsInGroup;

      // Pokud je i menší nebo rovno počtu týmů, který vznikl zbytek po dělení týmů počtem skupin, zvýšíme počet týmů ve skupině o 1
      // to se děje do chvíle, kdy zbytek po dělení bude stejný jako číslo skupiny
      if (i <= extraTeams) {
        numberOfParticipantsInThisGroup += 1;
      }

      // Vytvoření nového seznamu (skupiny turnaje)  
      const newUl = document.createElement('ul');
      // Přidání id seznamu
      newUl.id = `group-${i}`;
      // Vytvoření tagu názvu skupiny
      const groupHeader = document.createElement('h4');
      // Vytvoření názvu skupiny
      groupHeader.textContent = `Skupina ${i}`;
      // Přidání do seznamu
      newUl.appendChild(groupHeader);

      // Cyklus pro vložení týmů do skupin 
      for (let j = 1; j <= numberOfParticipantsInThisGroup; j++) {
        // Vytvoření nové položky
        const newLi = document.createElement('li');
        // Vytvoření tagu input s id a vložení do položky seznamu
        newLi.innerHTML = `<input type="text" id="teamName-${count}" placeholder="Účastník ${count}">`;
        // Přidání do seznamu pod název seznamu
        newUl.appendChild(newLi);
        // Zvýšení čísla, které je přiřazenu k účastníkovi turnaje jako id
        count++;
      }
      teamsList.appendChild(newUl);
    }

    const backButton = document.createElement('button');
    backButton.classList.add('btn', 'btn-primary', 'p-2', 'm-2');
    backButton.textContent = 'Zpět';
    backButton.addEventListener('click', () => {
      form.classList.remove('hidden');
      tournamentInfo.classList.add('hidden');
      teamsList.innerHTML = "";
    });
    teamsList.appendChild(backButton);

    const submitButton = document.createElement('button');
    submitButton.classList.add('btn', 'btn-primary', 'p-2', 'm-2');
    submitButton.textContent = 'Odeslat týmy';
    submitButton.id = 'submitTeamsList';
    submitButton.disabled = true; // Tlačítko je na začátku zakázané
    teamsList.appendChild(submitButton);

    // Validace vstupních polí
    const inputs = teamsList.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        submitButton.disabled = [...inputs].some(input => !input.value.trim());
      });
    });

    submitButton.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        const teamsData = [];

        for (let i = 1; i <= data.numberOfParticipants; i++) {
          const teamInput = document.getElementById(`teamName-${i}`);
          const team_id = teamInput.id.split('-')[1];
          if (teamInput && teamInput.value.trim()) {
            const groupId = document.querySelector(`#teamName-${i}`).closest('ul').id;
            const group_id = groupId.split('-')[1];

            teamsData.push({
              name: teamInput.value.trim(),
              team_id: parseInt(team_id, 10),
              group_id: parseInt(group_id, 10),
            });
          }
        }

        // teamsList.classList.add('hidden');
        console.log('Odesílaná data týmů:', teamsData);

        if (teamsData.length < data.numberOfParticipants) {
          alert('Vyplňte prosím všechna jména týmů.');
          return;
        }

        // 🧹 Vyčištění tabulky
        const { error: deleteError } = await supabase
          .from('teams')
          .delete()
          .neq('id', 0);

        if (deleteError) {
          console.error('Chyba při mazání tabulky:', deleteError.message);
          alert(`Chyba při mazání tabulky: ${deleteError.message}`);
          return;
        }

        console.log('Tabulka byla úspěšně vyčištěna.');

        // Hromadné odesílání dat do Supabase
        const { data: insertedData, error } = await supabase
          .from('teams')
          .insert(teamsData)
          .select();

        if (error) {
          console.error('Chyba při odesílání týmů:', error.message);
          alert(`Chyba při odesílání týmů: ${error.message}`);
        } else {
          console.log('Týmy úspěšně uloženy:', insertedData);
          alert('Týmy byly úspěšně odeslány.');
        }
      } catch (error) {
        console.error('Neočekávaná chyba při odesílání týmů:', error.message);
        alert(`Neočekávaná chyba: ${error.message}`);
      }
    });
  }
}
