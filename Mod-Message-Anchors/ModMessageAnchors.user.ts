if (window.location.search.includes('version=2')) {
    $('.thread-msg')
        .each((i, n) => {
            const header = $(n);
            const timestamp = $(n).find('.relativetime');
            timestamp.wrap(`<a href="#${header.attr('id')}"></a>`);
        });
} else {
    $('.js-msg-body,.msg-body')
        .each((i, n) => {
            const message = $(n);
            const anchor = message.find('a[name]').first(); // assumes this is the only anchor with a name attribute
            const name = anchor.attr('name');
            message
                .find('div:eq(0)')
                .append(`<span class="d-block w100"><a class="my2" href="#${name}">${name}</a></span>`);
        });
}


export {};