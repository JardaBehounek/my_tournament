import { supabase } from "./module/dbConnection"
import {  handleFormSubmit } from "./module/formHandler";
import { createListOfTeams } from "./module/createTeamList";

document.addEventListener('DOMContentLoaded', () => {
const form = document.querySelector('#tournamentForm');
const teamList = document.querySelector('#teamsList');
const tournamentInfo = document.querySelector('#tournamentInfo');

// ---------- Formulář --------------------
  // tady připojuji funkci handleFormSubmit z modulu formHandler, do které posílám
  // jako argumenty form - přichycení formuláře do index.html
  // tournamentInfo - prvek, kam se uloží informace o turnaji do index.html
  // catchDataCallback - funkce, která se zavolá, pokud data přijdou z formuláře (do modulu formHandler)
  // a její výsledek se odešle z modulu formHandler do index.html (do modulu createTeamList)
  // v tomto případě se data odešlo do supabase, abychom mohli je uložit do databáze a vypsat na webu


if (form) {
  handleFormSubmit(form, tournamentInfo, (data) => {
    console.log(data);
    try {
      console.log('Data přijata z formuláře:', data);
     
      // ---------- Seznam týmů --------------------
      // načtení modulu z createTeamList.js
      createListOfTeams(data, tournamentInfo, teamList) 
     
    } catch (error) {
      console.error('Chyba při zpracování dat z formuláře:', error);
    }
  });
} else {
  console.error('Formulář #tournamentForm nebyl nalezen.');
}
})

