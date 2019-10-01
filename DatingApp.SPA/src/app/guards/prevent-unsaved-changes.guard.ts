import { MemberEditComponent } from './../components/members/member-edit/member-edit.component';
import { CanDeactivate } from '@angular/router';

export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
    canDeactivate(component: MemberEditComponent): boolean  {
        if (component.editForm.dirty) {
            return confirm('Are you sure to continue? Any unsaved changes will be lost');
        }

        return true;
    }
}
