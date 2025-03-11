
//----------- Formulář vytváření turnaje ----------------------------------------------------------------
export function handleFormSubmit(form, tournamentInfo, catchDataCallback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const formData = new FormData(form)
      //------- Načtení dat z formuláře ------------
      const dataFromForm = {
        nameOfTournament: formData.get('nameOfTournament')?.trim(),
        placeOfTournament: formData.get('placeOfTournament')?.trim(),
        dateOfTournament: formData.get('dateOfTournament'),
        timeOfTournament: formData.get('timeOfTournament'),
        numberOfParticipants: Number(formData.get('numberOfParticipants')),
        numberOfGroups: Number(formData.get('numberOfGroups')),
      };
  
      const errors = [];
  
      if (!dataFromForm.nameOfTournament || dataFromForm.nameOfTournament.length < 3) {
        errors.push('Název turnaje musí mít alespoň 3 znaky.');
      }
  
      if (!dataFromForm.placeOfTournament) {
        errors.push('Místo konání nesmí být prázdné.');
      }
  
      if (!dataFromForm.dateOfTournament) {
        errors.push('Datum konání je povinné.');
      }
  
      if (!dataFromForm.timeOfTournament) {
        errors.push('Čas konání je povinný.');
      }
  
      if (isNaN(dataFromForm.numberOfParticipants) || dataFromForm.numberOfParticipants <= 0) {
        errors.push('Počet účastníků musí být kladné číslo.');
      }
  
      if (isNaN(dataFromForm.numberOfGroups) || dataFromForm.numberOfGroups <= 0) {
        errors.push('Počet skupin musí být kladné číslo.');
      }
  
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }
  
    //   form.reset();
  
      if (typeof catchDataCallback === 'function') {
        catchDataCallback(dataFromForm);
      }
  
      
      if (tournamentInfo) {
        tournamentInfo.classList.remove('hidden');
      } else {
        console.warn('Element #tournamentInfo nebyl nalezen.');
      }
    });
  }