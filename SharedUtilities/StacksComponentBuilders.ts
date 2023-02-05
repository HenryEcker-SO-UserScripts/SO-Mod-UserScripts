// JQuery Component Builders
export function attachAttributes<T>(e: JQuery<T>, attrs: Record<string, unknown>): JQuery<T> {
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            e.addClass(value as string);
        } else if (key === 'htmlFor') {
            e.attr('for', value as string);
        } else if (value === true || value === false) {
            e.prop(key, value);
        } else {
            e.attr(key, value as string);
        }
    }
    return e;
}


export function buildLabel(text: string, attrs?: Record<string, unknown>): JQuery<HTMLLabelElement> {
    return attachAttributes(
        $(`<label class="s-label">${text}</label>`),
        attrs ?? {}
    );
}

export function buildInput(attrs: Record<string, unknown>): JQuery<HTMLInputElement> {
    return attachAttributes(
        $('<input class="s-input"/>'),
        attrs
    );
}

export function buildButton(text: string, attrs?: Record<string, unknown>): JQuery<HTMLButtonElement> {
    return attachAttributes(
        $(`<button class="s-btn">${text}</button>`),
        attrs ?? {}
    );
}