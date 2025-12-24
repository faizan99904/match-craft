import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HeaderNavComponent } from '../../shared/header-nav/header-nav.component';
import { BackendService } from '../../services/backend.service';
import { PermissionService } from '../../services/permission.service';

interface ApiResponse {
  meta: {
    statusCode: number;
    status: string;
    message: string;
  };
  data: PermissionRole[];
}

interface PermissionRole {
  _id: string;
  role: string;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface Module {
  _id: string;
  name: string;
  allowed: boolean;
  subModules: SubModule[];
}

interface SubModule {
  _id: string;
  name: string;
  allowed: boolean;
  subModules: ChildModule[];
}

interface ChildModule {
  _id: string;
  name: string;
  allowed: boolean;
}

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderNavComponent],
})
export class PermissionsComponent implements OnInit {
  newRoleName: string = '';
  searchDataValue: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  formError: string = '';
  showModal: boolean = false;
  isEditing: boolean = false;

  permissionsForm!: FormGroup;

  tableData: PermissionRole[] = [];
  filteredData: PermissionRole[] = [];

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private toastr: ToastrService,
    private permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadPermissions();
  }

  private initializeForm(): void {
    this.permissionsForm = this.fb.group({
      _id: [''],
      role: ['', [Validators.required, Validators.maxLength(50)]],
      modules: this.fb.array([]),
    });
  }

  get modulesFA(): FormArray {
    return this.permissionsForm.get('modules') as FormArray;
  }

  getArray(control: AbstractControl): FormArray {
    return control.get('subModules') as FormArray;
  }

  getSubModules(moduleCtrl: AbstractControl): FormArray {
    return moduleCtrl.get('subModules') as FormArray;
  }

  getChildModules(subModuleCtrl: AbstractControl): FormArray {
    return subModuleCtrl.get('subModules') as FormArray;
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.backendService.getAllPermissions().subscribe({
      next: (response: ApiResponse) => {
        if (response.meta.status === 'success' && response.data) {
          this.tableData = response.data.map((role) => ({
            ...role,
            permissionsCount: this.calculatePermissionCount(role.modules),
          }));
          this.filteredData = [...this.tableData];
        } else {
          this.errorMessage =
            response.meta.message || 'Failed to load permissions';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.errorMessage =
          error.error?.meta?.message ||
          'Failed to load permissions. Please try again.';
        this.isLoading = false;
      },
    });
  }

  searchData(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredData = [...this.tableData];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredData = this.tableData.filter((role) =>
      role.role.toLowerCase().includes(term)
    );
  }

  private calculatePermissionCount(modules: Module[]): number {
    if (!modules) return 0;

    let count = 0;
    modules.forEach((module) => {
      if (module.allowed) count++;
      module.subModules?.forEach((subModule) => {
        if (subModule.allowed) count++;
        subModule.subModules?.forEach((child) => {
          if (child.allowed) count++;
        });
      });
    });
    return count;
  }

  getTotalPermissions(role: PermissionRole): number {
    return this.calculatePermissionCount(role.modules);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  openAddRoleModal(): void {
    if (!this.newRoleName || this.newRoleName.trim().length === 0) {
      this.formError = 'Please enter a role name';
      return;
    }

    this.isEditing = false;
    this.formError = '';

    this.permissionsForm.reset({
      _id: '',
      role: this.newRoleName.trim(),
    });

    if (this.tableData.length > 0 && this.tableData[0].modules) {
      this.initializeModulesForm(this.tableData[0].modules, false);
    } else {
      const defaultModules: Module[] = [
        {
          _id: '',
          name: 'Cricket',
          allowed: false,
          subModules: [],
        },
      ];
      this.initializeModulesForm(defaultModules, false);
    }

    this.showModal = true;
  }

  viewPermission(role: PermissionRole): void {
    this.isEditing = true;
    this.formError = '';

    this.permissionsForm.patchValue({
      _id: role._id,
      role: role.role,
    });

    this.initializeModulesForm(role.modules, true);

    this.showModal = true;
  }

  private initializeModulesForm(
    modules: Module[],
    useExistingValues: boolean
  ): void {
    this.modulesFA.clear();

    if (!modules || modules.length === 0) {
      return;
    }

    modules.forEach((module) => {
      this.modulesFA.push(this.createModuleGroup(module, useExistingValues));
    });
  }

  private createModuleGroup(
    module: Module,
    useExistingValues: boolean
  ): FormGroup {
    return this.fb.group({
      _id: [module._id || ''],
      name: [module.name],
      allowed: [useExistingValues ? module.allowed : false],
      subModules: this.fb.array(
        (module.subModules || []).map((subModule) =>
          this.createSubModuleGroup(subModule, useExistingValues)
        )
      ),
    });
  }

  private createSubModuleGroup(
    subModule: SubModule,
    useExistingValues: boolean
  ): FormGroup {
    return this.fb.group({
      _id: [subModule._id || ''],
      name: [subModule.name],
      allowed: [useExistingValues ? subModule.allowed : false],
      subModules: this.fb.array(
        (subModule.subModules || []).map((child) =>
          this.createChildGroup(child, useExistingValues)
        )
      ),
    });
  }

  private createChildGroup(
    child: ChildModule,
    useExistingValues: boolean
  ): FormGroup {
    return this.fb.group({
      _id: [child._id || ''],
      name: [child.name],
      allowed: [useExistingValues ? child.allowed : false],
    });
  }

  onModuleToggle(moduleIndex: number): void {
    const moduleGroup = this.modulesFA.at(moduleIndex) as FormGroup;
    const isAllowed = moduleGroup.get('allowed')?.value;
    const subModules = moduleGroup.get('subModules') as FormArray;

    this.toggleAllSubModules(subModules, isAllowed);
  }

  onSubModuleToggle(moduleIndex: number, subModuleIndex: number): void {
    const moduleGroup = this.modulesFA.at(moduleIndex) as FormGroup;
    const subModules = moduleGroup.get('subModules') as FormArray;
    const subModuleGroup = subModules.at(subModuleIndex) as FormGroup;
    const isAllowed = subModuleGroup.get('allowed')?.value;
    const children = subModuleGroup.get('subModules') as FormArray;

    this.toggleAllChildren(children, isAllowed);

    this.updateParentModuleState(moduleGroup);
  }

  onChildToggle(
    moduleIndex: number,
    subModuleIndex: number,
    childIndex: number
  ): void {
    const moduleGroup = this.modulesFA.at(moduleIndex) as FormGroup;
    const subModules = moduleGroup.get('subModules') as FormArray;
    const subModuleGroup = subModules.at(subModuleIndex) as FormGroup;
    const children = subModuleGroup.get('subModules') as FormArray;

    const allChildrenAllowed = children.controls.every(
      (child: AbstractControl) => (child as FormGroup).get('allowed')?.value
    );

    subModuleGroup
      .get('allowed')
      ?.setValue(allChildrenAllowed, { emitEvent: false });

    this.updateParentModuleState(moduleGroup);
  }

  private toggleAllSubModules(subModules: FormArray, isAllowed: boolean): void {
    subModules.controls.forEach((subModule: AbstractControl) => {
      const subModuleGroup = subModule as FormGroup;
      subModuleGroup.get('allowed')?.setValue(isAllowed, { emitEvent: false });

      const children = subModuleGroup.get('subModules') as FormArray;
      this.toggleAllChildren(children, isAllowed);
    });
  }

  private toggleAllChildren(children: FormArray, isAllowed: boolean): void {
    children.controls.forEach((child: AbstractControl) => {
      (child as FormGroup)
        .get('allowed')
        ?.setValue(isAllowed, { emitEvent: false });
    });
  }

  private updateParentModuleState(moduleGroup: FormGroup): void {
    const subModules = moduleGroup.get('subModules') as FormArray;
    const allSubModulesAllowed = subModules.controls.every(
      (subModule: AbstractControl) =>
        (subModule as FormGroup).get('allowed')?.value
    );

    moduleGroup
      .get('allowed')
      ?.setValue(allSubModulesAllowed, { emitEvent: false });
  }

  onPermissionsSubmit(): void {
    if (this.permissionsForm.invalid) {
      this.markFormGroupTouched(this.permissionsForm);
      this.formError = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const formData = this.prepareFormData();

    if (this.isEditing) {
      this.updateRole(formData);
    } else {
      this.createRole(formData);
    }
  }

  private prepareFormData(): any {
    const formValue = this.permissionsForm.value;

    return {
      _id: formValue._id,
      role: formValue.role.toUpperCase(),
      modules: formValue.modules.map((module: any) => ({
        _id: module._id,
        name: module.name,
        allowed: module.allowed,
        subModules: module.subModules.map((subModule: any) => ({
          _id: subModule._id,
          name: subModule.name,
          allowed: subModule.allowed,
          subModules: subModule.subModules.map((child: any) => ({
            _id: child._id,
            name: child.name,
            allowed: child.allowed,
          })),
        })),
      })),
    };
  }

  private createRole(roleData: any): void {
    const { _id, ...dataWithoutId } = roleData;

    this.backendService.addPermission(dataWithoutId).subscribe({
      next: (response: any) => {
        if (response.meta.status === 'success') {
          this.loadPermissions();
          this.closeModal();
          this.newRoleName = '';
          this.toastr.success('Role created successfully!');
        } else {
          this.formError = response.meta.message || 'Failed to create role';
          this.toastr.error(this.formError, 'Error');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating role:', error);
        this.formError =
          error.error?.meta?.message ||
          'Failed to create role. Please try again.';
        this.toastr.error(this.formError, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  private updateRole(roleData: any): void {
    const payload = {
      role: roleData.role.toUpperCase(),
      modules: roleData.modules.map((module: any) => ({
        name: module.name,
        allowed: module.allowed,
      })),
    };

    const roleId = roleData._id;

    this.backendService.updatePermission(payload, roleId).subscribe({
      next: (response: any) => {
        if (response.meta.status === 'success') {
          this.loadPermissions();
          this.closeModal();
          if (response.meta.status === 'success') {
            this.loadPermissions();
            const loggedInRole = localStorage.getItem('role');

            if (loggedInRole === payload.role) {
              this.permissionService.loadPermissions();
            }

            this.closeModal();
            this.toastr.success('Role updated successfully!');
          }

        } else {
          this.formError = response.meta.message || 'Failed to update role';
          this.toastr.error(this.formError, 'Error');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating role:', error);
        this.formError =
          error.error?.meta?.message ||
          'Failed to update role. Please try again.';
        this.toastr.error(this.formError, 'Error');
        this.isSubmitting = false;
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.formError = '';
    this.permissionsForm.reset();
    this.modulesFA.clear();
  }

  onModalBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  onModalContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  clearSearch(): void {
    this.searchDataValue = '';
    this.filteredData = [...this.tableData];
  }
}
