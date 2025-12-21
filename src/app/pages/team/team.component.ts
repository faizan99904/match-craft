import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CONFIG } from '../../../config';

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

interface TeamOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-team',
  imports: [ReactiveFormsModule, CommonModule],
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

  // File handling
  teamAFlagFile: File | null = null;
  teamBFlagFile: File | null = null;
  teamAFlagPreview: string | ArrayBuffer | null = null;
  teamBFlagPreview: string | ArrayBuffer | null = null;

  // Dropdown handling
  showTeamADropdown = false;
  showTeamBDropdown = false;

  // Available teams for dropdown
  availableTeams: TeamOption[] = [
    { name: 'India', code: 'IND' },
    { name: 'Australia', code: 'AUS' },
    { name: 'Pakistan', code: 'PAK' }
  ];

  playerTypes = [
    { value: 'BATSMAN', label: 'BATSMAN' },
    { value: 'BOWLER', label: 'BOWLER' },
    { value: 'ALL_ROUNDER', label: 'ALL ROUNDER' },
    { value: 'KEEPER', label: 'KEEPER' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.teamForm = this.createTeamForm();
  }

  ngOnInit(): void {
    this.initializeForm();

    // Auto-fill title when both teams are selected
    this.teamForm.get('teamAName')?.valueChanges.subscribe(() => {
      this.autoFillTitle();
    });

    this.teamForm.get('teamBName')?.valueChanges.subscribe(() => {
      this.autoFillTitle();
    });
  }

  createTeamForm(): FormGroup {
    return this.fb.group({
      matchId: ['', Validators.required],
      eventId: ['', Validators.required],
      type: ['', Validators.required],
      title: ['', Validators.required],
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

  // Team selection methods
  selectTeamA(team: TeamOption): void {
    this.teamForm.patchValue({
      teamAName: team.name,
      teamAShortCode: team.code
    });
    this.showTeamADropdown = false;
  }

  selectTeamB(team: TeamOption): void {
    this.teamForm.patchValue({
      teamBName: team.name,
      teamBShortCode: team.code
    });
    this.showTeamBDropdown = false;
  }

  onTeamABlur(): void {
    setTimeout(() => {
      this.showTeamADropdown = false;
    }, 200);
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

  // File upload methods
  onTeamAFlagChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.teamAFlagFile = file;

      // Create preview
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

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.teamBFlagPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Team A Players Methods
  getTeamAPlayers(): FormArray {
    return this.teamForm.get('teamAPlayers') as FormArray;
  }

  createPlayer(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required]
    });
  }

  addTeamAPlayer(): void {
    if (this.getTeamAPlayers().length < 11) {
      this.getTeamAPlayers().push(this.createPlayer());
    }
  }

  removeTeamAPlayer(): void {
    if (this.getTeamAPlayers().length > 1) {
      this.getTeamAPlayers().removeAt(this.getTeamAPlayers().length - 1);
    }
  }

  // Team B Players Methods
  getTeamBPlayers(): FormArray {
    return this.teamForm.get('teamBPlayers') as FormArray;
  }

  addTeamBPlayer(): void {
    if (this.getTeamBPlayers().length < 11) {
      this.getTeamBPlayers().push(this.createPlayer());
    }
  }

  removeTeamBPlayer(): void {
    if (this.getTeamBPlayers().length > 1) {
      this.getTeamBPlayers().removeAt(this.getTeamBPlayers().length - 1);
    }
  }

  // Form Submission
  onSubmit(): void {
    if (this.teamForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const formData = this.prepareSubmitData();
      this.previewData = this.preparePreviewData();
      this.showPreview = true;

      // For actual API call with FormData
      this.http.post(CONFIG.addTeamEvent, formData).subscribe({
        next: (response) => {
          this.handleSuccess(response);
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      this.markFormGroupTouched(this.teamForm);
      this.submitMessage = 'Please fill all required fields correctly';
      this.submitStatus = 'error';
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

    // Add text fields
    formData.append('eventId', this.teamForm.get('eventId')?.value);
    formData.append('matchId', this.teamForm.get('matchId')?.value);
    formData.append('title', this.teamForm.get('title')?.value);
    formData.append('teamA', JSON.stringify(teamA));
    formData.append('teamB', JSON.stringify(teamB));

    // Add files if selected
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
}