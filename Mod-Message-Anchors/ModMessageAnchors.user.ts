$('.js-msg-body,.msg-body')
    .each((i, n) => {
        const message = $(n);
        const anchor = message.find('a[name]').first(); // assumes this is the only anchor with a name attribute
        const name = anchor.attr('name');
        message
            .find('div:eq(0)')
            .append(`<span class="d-block w100"><a class="my2" href="#${name}">${name}</a></span>`);
    });

export {};