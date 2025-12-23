import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../../../config';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from '../../services/backend.service';
import { HeaderNavComponent } from "../../shared/header-nav/header-nav.component";
import { ActivatedRoute, Router } from '@angular/router';

export enum PlayerType {
  BATSMAN = 'BATSMAN',
  BOWLER = 'BOWLER',
  ALL_ROUNDER = 'ALL_ROUNDER',
  KEEPER = 'KEEPER'
}

interface Player {
  name: string;
  type: PlayerType | string;
}

interface Team {
  teamName: string;
  teamCode: string;
  players: Player[];
}



@Component({
  selector: 'app-team',
  imports: [ReactiveFormsModule, CommonModule, HeaderNavComponent],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {
  teamForm: FormGroup;



  isSubmitting = false;
  submitMessage = '';
  submitStatus = '';
  showPreview = false;
  previewData: any;

  teamAPreviewPath: any
  teamABreviewPath: any


  teamAFlagFile: File | null = null;
  teamBFlagFile: File | null = null;
  teamAFlagPreview: string | ArrayBuffer | null = null;
  teamBFlagPreview: string | ArrayBuffer | null = null;


  eventId: any

  showTeamADropdown = false;
  showTeamBDropdown = false;


  availableTeams: any = []

  filterAvailableATeams: any = []
  filterAvailableBTeams: any = []

  playerTypes = [
    { value: 'BATSMAN', label: 'BATSMAN' },
    { value: 'BOWLER', label: 'BOWLER' },
    { value: 'ALL_ROUNDER', label: 'ALL ROUNDER' },
    { value: 'KEEPER', label: 'KEEPER' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private toaster: ToastrService, private backend: BackendService, private route: ActivatedRoute, private router: Router) {
    this.teamForm = this.createTeamForm();
    this.route.queryParams.subscribe((params: any) => {
      this.eventId = params.eventId;
    });
  }

  ngOnInit(): void {
    this.initializeForm();


    this.teamForm.get('teamAName')?.valueChanges.subscribe(() => {
      this.autoFillTitle();
    });

    this.teamForm.get('teamBName')?.valueChanges.subscribe(() => {
      this.autoFillTitle();
    });

    this.teamForm.get('teamAName')?.valueChanges.subscribe(value => {
  if (!value || value.trim() === '') {
    this.resetTeamA();
  }
});

this.teamForm.get('teamAShortCode')?.valueChanges.subscribe(value => {
  if (!value || value.trim() === '') {
    this.resetTeamA();
  }
});

this.teamForm.get('teamBName')?.valueChanges.subscribe(value => {
  if (!value || value.trim() === '') {
    this.resetTeamB();
  }
});

this.teamForm.get('teamBShortCode')?.valueChanges.subscribe(value => {
  if (!value || value.trim() === '') {
    this.resetTeamB();
  }
});



    if (this.eventId) {
      this.loadEventById()
    }
    this.getAvailableTeam();
  }


  loadEventById() {
    this.http
      .get(`${CONFIG.getEventsById}/${this.eventId}`)
      .subscribe((res: any) => {
        const data = res.data;

        this.teamForm.patchValue({
          matchId: data.matchId,
          eventId: data.eventId,
          type: data.type,
          teamAName: data.teamA.teamName,
          teamAShortCode: data.teamA.teamCode,
          teamBName: data.teamB.teamName,
          teamBShortCode: data.teamB.teamCode
        });


        this.teamAPlayers.clear();
        this.teamBPlayers.clear();


        this.teamAFlagPreview = data.teamA.flag;

        this.teamBFlagPreview = data.teamB.flag;



        data.teamA.players.forEach((player: any) => {
          this.teamAPlayers.push(this.createPlayer(player));
        });


        data.teamB.players.forEach((player: any) => {
          this.teamBPlayers.push(this.createPlayer(player));
        });
      });
  }

  getAvailableTeam() {
    this.http.get(CONFIG.getTeams).subscribe((data: any) => {
      this.availableTeams = data.data.teams;
       this.filterAvailableATeams = [...this.availableTeams];
       this.filterAvailableBTeams = [...this.availableTeams];
    })
  }



  get teamAPlayers(): FormArray {
    return this.teamForm.get('teamAPlayers') as FormArray;
  }

  get teamBPlayers(): FormArray {
    return this.teamForm.get('teamBPlayers') as FormArray;
  }


  createTeamForm(): FormGroup {
    return this.fb.group({
      matchId: ['', Validators.required],
      eventId: ['', Validators.required],
      type: ['ODI', Validators.required],
      teamAName: ['', [Validators.required, Validators.minLength(2)]],
      teamAShortCode: ['', [Validators.required, Validators.maxLength(3)]],
      teamAPlayers: this.fb.array([]),
      teamBName: ['', [Validators.required, Validators.minLength(2)]],
      teamBShortCode: ['', [Validators.required, Validators.maxLength(3)]],
      teamBPlayers: this.fb.array([])
    });
  }

  initializeForm(): void {
    this.addTeamAPlayer();
    this.addTeamBPlayer();
  }


async selectTeamA(team: any): Promise<void> {
  this.teamAPlayers.clear();

  this.teamForm.patchValue({
    teamAName: team.name,
    teamAShortCode: team.code
  });

  this.teamAFlagPreview = team.flag;

  if (team.flag) {
    this.teamAFlagFile = await this.convertLocalImageToFile(
      team.flag,
      `${team.code}.png`
    );
  }

  team.players.forEach((player: any) => {
    this.teamAPlayers.push(this.createPlayer(player));
  });

  if (this.teamAPlayers.length === 0) {
    this.addTeamAPlayer();
  }

  this.showTeamADropdown = false;
}


async selectTeamB(team: any): Promise<void> {
  this.teamBPlayers.clear();

  this.teamForm.patchValue({
    teamBName: team.name,
    teamBShortCode: team.code
  });

  this.teamBFlagPreview = team.flag;

  if (team.flag) {
    this.teamBFlagFile = await this.convertLocalImageToFile(
      team.flag,
      `${team.code}.png`
    );
  }

  team.players.forEach((player: any) => {
    this.teamBPlayers.push(this.createPlayer(player));
  });

  if (this.teamBPlayers.length === 0) {
    this.addTeamBPlayer();
  }

  this.showTeamBDropdown = false;
}


  async convertLocalImageToFile(imagePath: string, fileName: string): Promise<File> {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Error converting image to file:', error);
      throw error;
    }
  }



  onTeamBBlur(): void {
    setTimeout(() => {
      this.showTeamBDropdown = false;
    }, 200);
  }

  autoFillTitle(): void {
    const teamAName = this.teamForm.get('teamAName')?.value;
    const teamBName = this.teamForm.get('teamBName')?.value;

    if (teamAName && teamBName) {
      this.teamForm.patchValue({
        title: `${teamAName} vs ${teamBName}`
      });
    }
  }

  onTeamAFlagChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.teamAFlagFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.teamAFlagPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onTeamBFlagChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.teamBFlagFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.teamBFlagPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getTeamAPlayers(): FormArray {
    return this.teamForm.get('teamAPlayers') as FormArray;
  }

  createPlayer(player?: any): FormGroup {
    return this.fb.group({
      name: [player?.name || '', [Validators.required, Validators.minLength(2)]],
      type: [player?.type || '', Validators.required],
      _id: [player?._id || null]
    });
  }

  addTeamAPlayer(): void {
    if (this.getTeamAPlayers().length < 11) {
      this.getTeamAPlayers().push(this.createPlayer());
    }
  }



  getTeamBPlayers(): FormArray {
    return this.teamForm.get('teamBPlayers') as FormArray;
  }

  addTeamBPlayer(): void {
    if (this.getTeamBPlayers().length < 11) {
      this.getTeamBPlayers().push(this.createPlayer());
    }
  }



  onSubmit(): void {
    if (this.teamForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const formData = this.prepareSubmitData();
      this.previewData = this.preparePreviewData();

      if (this.eventId) {
        this.http.put(`${CONFIG.updateTeamEvent}/${this.eventId}`, formData).subscribe({
          next: (response: any) => {
            this.handleSuccess(response);
            this.toaster.success(response.meta.message);
            this.isSubmitting = false;
            this.router.navigateByUrl('/events')

          },
          error: (error) => {
            this.handleError(error);
            this.isSubmitting = false;
          }
        })
      } else {
        this.backend.addPlayerEvent(formData).subscribe({
          next: (response: any) => {
            this.handleSuccess(response);
            this.toaster.success(response.meta.message);
            this.isSubmitting = false;
            this.router.navigateByUrl('/events')
          },
          error: (error) => {
            this.handleError(error);
            this.isSubmitting = false;
          }
        });
      }


    } else {
      this.markFormGroupTouched(this.teamForm);
      this.submitMessage = 'Please fill all required fields correctly';
      this.submitStatus = 'error';
      this.isSubmitting = false;
    }
  }

  prepareSubmitData(): FormData {
    const teamA: Team = {
      teamName: this.teamForm.get('teamAName')?.value,
      teamCode: this.teamForm.get('teamAShortCode')?.value,
      players: this.getTeamAPlayers().value
    };

    const teamB: Team = {
      teamName: this.teamForm.get('teamBName')?.value,
      teamCode: this.teamForm.get('teamBShortCode')?.value,
      players: this.getTeamBPlayers().value
    };

    const formData = new FormData();

    formData.append('eventId', this.teamForm.get('eventId')?.value);
    formData.append('type', this.teamForm.get('type')?.value);
    formData.append('matchId', this.teamForm.get('matchId')?.value);
    formData.append('teamA', JSON.stringify(teamA));
    formData.append('teamB', JSON.stringify(teamB));

    if (this.teamAFlagFile) {
      formData.append('teamAFlag', this.teamAFlagFile, this.teamAFlagFile.name);
    }

    if (this.teamBFlagFile) {
      formData.append('teamBFlag', this.teamBFlagFile, this.teamBFlagFile.name);
    }

    return formData;
  }

  preparePreviewData(): any {
    return {
      eventId: this.teamForm.get('eventId')?.value,
      matchId: this.teamForm.get('matchId')?.value,
      title: this.teamForm.get('title')?.value,
      teamA: {
        teamName: this.teamForm.get('teamAName')?.value,
        teamCode: this.teamForm.get('teamAShortCode')?.value,
        players: this.getTeamAPlayers().value
      },
      teamB: {
        teamName: this.teamForm.get('teamBName')?.value,
        teamCode: this.teamForm.get('teamBShortCode')?.value,
        players: this.getTeamBPlayers().value
      },
      teamAFlag: this.teamAFlagFile ? this.teamAFlagFile.name : 'No file selected',
      teamBFlag: this.teamBFlagFile ? this.teamBFlagFile.name : 'No file selected'
    };
  }

  handleSuccess(response: any): void {
    this.isSubmitting = false;
    this.submitMessage = 'Event submitted successfully!';
    this.submitStatus = 'success';

    setTimeout(() => {
      this.resetForm();
      this.submitMessage = '';
    }, 3000);
  }

  handleError(error: any): void {
    this.isSubmitting = false;
    this.submitMessage = 'Error submitting event. Please try again.';
    this.submitStatus = 'error';
    console.error('Submission error:', error);
  }

  resetForm(): void {
    this.teamForm.reset();
    this.teamAFlagFile = null;
    this.teamBFlagFile = null;
    this.teamAFlagPreview = null;
    this.teamBFlagPreview = null;

    while (this.getTeamAPlayers().length !== 0) {
      this.getTeamAPlayers().removeAt(0);
    }
    while (this.getTeamBPlayers().length !== 0) {
      this.getTeamBPlayers().removeAt(0);
    }

    this.addTeamAPlayer();
    this.addTeamBPlayer();
    this.showPreview = false;
    this.submitMessage = '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }



  removeTeamAPlayerAt(index: number): void {
    const playersArray = this.getTeamAPlayers();
    if (playersArray.length > 1) {
      playersArray.removeAt(index);
    }
  }

  removeTeamBPlayerAt(index: number): void {
    const playersArray = this.getTeamBPlayers();
    if (playersArray.length > 1) {
      playersArray.removeAt(index);
    }
  }


  removeTeamAPlayer(): void {
    if (this.getTeamAPlayers().length > 1) {
      this.getTeamAPlayers().removeAt(this.getTeamAPlayers().length - 1);
    }
  }

  removeTeamBPlayer(): void {
    if (this.getTeamBPlayers().length > 1) {
      this.getTeamBPlayers().removeAt(this.getTeamBPlayers().length - 1);
    }
  }


  // searchTeamA(searchTerm: string): void {
  //   this.showTeamADropdown = true;

  //   if (!searchTerm.length) {
  //     this.showTeamADropdown = false;
  //     return;
  //   }


  //   if (!searchTerm || searchTerm.trim() === '') {
  //     this.filterAvailableATeams = [...this.availableTeams];
  //     return;
  //   }

  //   const term = searchTerm.toLowerCase().trim();
  //   this.filterAvailableATeams = this.availableTeams.filter((team: any) =>
  //     team.name.toLowerCase().includes(term)
  //   );
  // }
  searchTeamA(searchTerm: string): void {
  this.showTeamADropdown = true;

  if (!searchTerm || searchTerm.trim() === '') {
    this.filterAvailableATeams = [...this.availableTeams];
    return;
  }

  const term = searchTerm.toLowerCase();
  this.filterAvailableATeams = this.availableTeams.filter((team: any) =>
    team.name.toLowerCase().includes(term) ||
    team.code.toLowerCase().includes(term)
  );
}



  // searchTeamB(searchTerm: string): void {
  //   this.showTeamBDropdown = true;

  //   if (!searchTerm.length) {
  //     this.showTeamBDropdown = false;
  //     return;
  //   }


  //   if (!searchTerm || searchTerm.trim() === '') {
  //     this.filterAvailableBTeams = [...this.availableTeams];
  //     return;
  //   }

  //   const term = searchTerm.toLowerCase().trim();
  //   this.filterAvailableBTeams = this.availableTeams.filter((team: any) =>
  //     team.name.toLowerCase().includes(term) ||
  //     team.code.toLowerCase().includes(term)
  //   );
  // }
  searchTeamB(searchTerm: string): void {
  this.showTeamBDropdown = true;

  if (!searchTerm || searchTerm.trim() === '') {
    this.filterAvailableBTeams = [...this.availableTeams];
    return;
  }

  const term = searchTerm.toLowerCase();
  this.filterAvailableBTeams = this.availableTeams.filter((team: any) =>
    team.name.toLowerCase().includes(term) ||
    team.code.toLowerCase().includes(term)
  );
}

resetTeamA(): void {
  this.teamForm.patchValue(
    {
      teamAName: '',
      teamAShortCode: ''
    },
    { emitEvent: false } 
  );

  this.teamAPlayers.clear();
  this.addTeamAPlayer();

  this.teamAFlagFile = null;
  this.teamAFlagPreview = null;

  this.filterAvailableATeams = [...this.availableTeams];
  this.showTeamADropdown = true;
}
resetTeamB(): void {
  this.teamForm.patchValue(
    {
      teamBName: '',
      teamBShortCode: ''
    },
    { emitEvent: false }
  );

  this.teamBPlayers.clear();
  this.addTeamBPlayer();

  this.teamBFlagFile = null;
  this.teamBFlagPreview = null;

  this.filterAvailableBTeams = [...this.availableTeams];
  this.showTeamBDropdown = true;
}

@HostListener('document:click', ['$event'])
onOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (!target.closest('.team-a-wrapper')) {
    this.showTeamADropdown = false;
  }

  if (!target.closest('.team-b-wrapper')) {
    this.showTeamBDropdown = false;
  }
}



}