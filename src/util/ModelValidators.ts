import { FormControl } from '@angular/forms';

export class ModelValidators {
    /**
       * Custom validator for checking if user entered only 'spaces'
       */
    public static trimmedNotEmpty(c: FormControl): { trimmedNotEmpty: { valid: boolean } } {
        return ((c.value != null && c.value.trim() != '') || c.value == '') ? null : {
            trimmedNotEmpty: {
                valid: false
            }
        };
    }

    /**
     * Custom validator to check if a value is a valid email
     */
    public static emailValid(control: FormControl): { emailValid: { valid: boolean } } {

        var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        if (control.value != null && control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
            return {
                emailValid: {
                    valid: true
                }
            };
        }

        return null;
    }
}