// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.0.4
// @downloadURL  https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
// @updateURL    https://github.com/HenryEcker/SO-Mod-UserScripts/raw/master/BanEvasionAccountDeleteHelper/dist/BanEvasionAccountDeleteHelper.user.js
//
// @match        *://*.stackoverflow.com/users/account-info/*
//
// @grant        none
//
// ==/UserScript==
/* globals StackExchange, Stacks, $ */
(function() {
  "use strict";
  function getFormDataFromObject(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc.set(key, value);
      return acc;
    }, new FormData());
  }
  function getUserPii(userId) {
    return fetch("/admin/all-pii", {
      method: "POST",
      body: getFormDataFromObject({ id: userId, fkey: StackExchange.options.user.fkey })
    }).then((res) => res.text()).then((resText) => {
      const html = $(resText);
      return {
        email: html[1].children[1].innerText.trim(),
        name: html[1].children[3].innerText.trim(),
        ip: html[3].children[1].innerText.trim()
      };
    });
  }
  function fetchFullUrlFromUserId(userId) {
    return fetch(`/users/${userId}`, { method: "OPTIONS" }).then((res) => res.url);
  }
  function fetchUserIdFromHref(href, convertToNumber = true) {
    let match = href.match(/\/users\/(\d+)\/.*/i);
    if (match === null) {
      match = href.match(/users\/account-info\/(\d+)/i);
    }
    if (match === null || match.length < 2) {
      return void 0;
    }
    if (!convertToNumber) {
      return match[1];
    }
    return Number(match[1]);
  }
  function deleteUser(userId, deleteReason, deleteReasonDetails) {
    return fetch(`/admin/users/${userId}/delete`, {
      method: "POST",
      body: getFormDataFromObject({
        fkey: StackExchange.options.user.fkey,
        deleteReason,
        deleteReasonDetails
      })
    });
  }
  function annotateUser(userId, annotationDetails) {
    return fetch(`/admin/users/${userId}/annotate`, {
      method: "POST",
      body: getFormDataFromObject({
        fkey: StackExchange.options.user.fkey,
        annotation: annotationDetails
      })
    });
  }
  function attachAttrs(e, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        e.addClass(value);
      } else if (key === "htmlFor") {
        e.attr("for", value);
      } else {
        e.attr(key, value);
      }
    }
    return e;
  }
  function buildLabel(text, attrs) {
    return attachAttrs(
      $(`<label class="s-label">${text}</label>`),
      attrs ?? {}
    );
  }
  function buildInput(attrs) {
    return attachAttrs(
      $('<input class="s-input"/>'),
      attrs
    );
  }
  function buildButton(text, attrs) {
    return attachAttrs(
      $(`<button class="s-btn">${text}</button>`),
      attrs ?? {}
    );
  }
  const config = {
    ids: {
      modal: "beadh-modal",
      mainAccountIdInput: "beadh-main-account-id-input",
      deleteReasonDetails: "beadh-deleteReasonDetails",
      annotationDetails: "beadh-mod-menu-annotation"
    },
    validationBounds: {
      deleteReasonDetails: {
        min: 15,
        max: 600
      },
      annotationDetails: {
        min: 10,
        max: 300
      }
    }
  };
  function getUserIdFromAccountInfoURL() {
    const userId = fetchUserIdFromHref(window.location.pathname);
    if (userId === void 0) {
      const message = "Could not get Sock Id from URL";
      StackExchange.helpers.showToast(message, { transientTimeout: 3e3, type: "danger" });
      throw Error(message);
    }
    return userId;
  }
  function handleDeleteUser(userId, deletionDetails) {
    return deleteUser(
      userId,
      "This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly",
      deletionDetails
    ).then((res) => {
      if (res.status !== 200) {
        const message = `Deletion on ${userId} unsuccessful.`;
        StackExchange.helpers.showToast(message, { transient: false, type: "danger" });
        console.error(res);
        throw Error(message);
      }
    });
  }
  function handleAnnotateUser(userId, annotationDetails) {
    return annotateUser(userId, annotationDetails).then((res) => {
      if (res.status !== 200) {
        const message = `Annotation on ${userId} unsuccessful.`;
        StackExchange.helpers.showToast(message, { transient: false, type: "danger" });
        console.error(res);
        throw Error(message);
      }
    });
  }
  class DeleteEvasionAccountControls {
    mainAccountUrl;
    mainAccountId;
    sockUrl;
    sockAccountId;
    sockEmail;
    sockRealName;
    deletionDetails;
    annotationDetails;
    modalBodyContainer;
    mainAccountLookupControls;
    mainAccountInfoDisplay;
    constructor(sockAccountId) {
      this.sockAccountId = sockAccountId;
      this.modalBodyContainer = $('<div class="d-flex fd-column g12 mx8"></div>');
      this.mainAccountLookupControls = $('<div class="d-flex fd-row g4 jc-space-between ai-center"></div>');
      this.mainAccountInfoDisplay = $("<div></div>");
      this.modalBodyContainer.append(this.mainAccountLookupControls).append(this.mainAccountInfoDisplay);
      this.createMainAccountInput();
    }
    createMainAccountInput() {
      const input = buildInput({ type: "number", id: config.ids.mainAccountIdInput });
      const checkButton = buildButton("Resolve User URL", {
        className: "s-btn__primary",
        type: "button",
        style: "min-width:max-content;"
      });
      checkButton.on("click", (ev) => {
        ev.preventDefault();
        this.mainAccountId = Number(input.val());
        if (this.mainAccountId === this.sockAccountId) {
          StackExchange.helpers.showToast("Cannot enter current account ID in parent field.", {
            type: "danger",
            transientTimeout: 3e3
          });
          return;
        }
        input.prop("disabled", true);
        checkButton.prop("disabled", true);
        void fetchFullUrlFromUserId(this.mainAccountId).then((mainUrl) => {
          this.mainAccountUrl = mainUrl;
          this.createMainAccountInfoDisplay();
        });
      });
      this.mainAccountLookupControls.append(buildLabel("Enter Id For Main Account: ", {
        htmlFor: config.ids.mainAccountIdInput,
        style: "min-width:fit-content;"
      })).append(input).append(checkButton);
    }
    createMainAccountInfoDisplay() {
      this.mainAccountInfoDisplay.append(
        $('<div class="d-flex fd-row g6"></div>').append(buildLabel("Main account located here:")).append($(`<a href=${this.mainAccountUrl} target="_blank">${this.mainAccountUrl}</a>`))
      );
      this.createDeleteAndAnnotateControls();
    }
    static buildDetailStringFromObject(obj, keyValueSeparator, recordSeparator, alignColumns = false) {
      const filteredObj = Object.entries(obj).reduce((acc, [key, value]) => {
        if (value.length > 0) {
          acc[`${key}${keyValueSeparator}`] = value;
        }
        return acc;
      }, {});
      const getPaddingStr = function() {
        if (alignColumns) {
          const maxLabelLength = Math.max(...Object.keys(filteredObj).map((k) => k.length));
          return function(key) {
            return new Array(maxLabelLength - key.length + 1).join(" ");
          };
        } else {
          return function(_) {
            return "";
          };
        }
      }();
      return Object.entries(filteredObj).map(([key, value]) => `${key}${getPaddingStr(key)}${value}`).join(recordSeparator);
    }
    static buildTextarea(labelText, textareaConfig, initialText, changeHandler, validationBounds) {
      const label = buildLabel(labelText, {
        className: "flex--item",
        htmlFor: textareaConfig.id
      });
      const textarea = $('<textarea style="font-family:monospace" class="flex--item s-textarea" data-se-char-counter-target="field" data-is-valid-length="false"></textarea>');
      attachAttrs(textarea, textareaConfig);
      textarea.val(initialText);
      textarea.on("change", changeHandler);
      return $(`<div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="${validationBounds.min}" data-se-char-counter-max="${validationBounds.max}"></div>`).append(label).append(textarea).append('<div data-se-char-counter-target="output" class="cool"></div>');
    }
    buildDeleteReasonDetailsTextarea() {
      this.deletionDetails = `

${DeleteEvasionAccountControls.buildDetailStringFromObject({
        "Main Account": this.mainAccountUrl,
        "Email": this.sockEmail,
        "Real name": this.sockRealName
      }, ":  ", "\n", true)}`;
      return DeleteEvasionAccountControls.buildTextarea(
        "Please provide details leading to the deletion of this account (required):",
        {
          id: config.ids.deleteReasonDetails,
          name: "deleteReasonDetails",
          placeholder: "Please provide at least a brief explanation of what this user has done; this will be logged with the action and may need to be referenced later.",
          rows: 6
        },
        this.deletionDetails,
        (ev) => {
          this.deletionDetails = $(ev.target).val();
        },
        config.validationBounds.deleteReasonDetails
      );
    }
    buildAnnotateDetailsTextarea() {
      this.annotationDetails = DeleteEvasionAccountControls.buildDetailStringFromObject({
        "Deleted evasion account": this.sockUrl,
        "Email": this.sockEmail,
        "Real name": this.sockRealName
      }, ": ", " | ");
      return DeleteEvasionAccountControls.buildTextarea(
        "Annotate the main account (required): ",
        {
          id: config.ids.annotationDetails,
          name: "annotation",
          placeholder: "Examples: &quot;possible sock of /users/XXXX, see mod room [link] for discussion&quot; or &quot;left a series of abusive comments, suspend on next occurrence&quot;",
          rows: 4
        },
        this.annotationDetails,
        (ev) => {
          this.annotationDetails = $(ev.target).val();
        },
        config.validationBounds.annotationDetails
      );
    }
    createDeleteAndAnnotateControls() {
      void Promise.all([
        getUserPii(this.sockAccountId),
        fetchFullUrlFromUserId(this.sockAccountId)
      ]).then(([{ email, name }, sockUrl]) => {
        this.sockEmail = email;
        this.sockRealName = name;
        this.sockUrl = sockUrl;
        this.modalBodyContainer.append(this.buildDeleteReasonDetailsTextarea()).append(this.buildAnnotateDetailsTextarea());
      });
    }
    getForm() {
      return this.modalBodyContainer;
    }
    static validateLength(label, s, bounds) {
      if (s.length < bounds.min || s.length > bounds.max) {
        const message = `${label} has ${s.length} characters which is outside the supported bounds of ${bounds.min} to ${bounds.max}`;
        StackExchange.helpers.showToast(
          message,
          {
            transientTimeout: 3e3,
            type: "danger"
          }
        );
        throw Error(message);
      }
    }
    validateFields() {
      DeleteEvasionAccountControls.validateLength("Deletion reason details", this.deletionDetails, config.validationBounds.deleteReasonDetails);
      DeleteEvasionAccountControls.validateLength("Annotation details", this.annotationDetails, config.validationBounds.annotationDetails);
    }
    getDeletionDetails() {
      return {
        sockAccountId: this.sockAccountId,
        deletionDetails: this.deletionDetails
      };
    }
    getAnnotationDetails() {
      return {
        mainAccountId: this.mainAccountId,
        annotationDetails: this.annotationDetails
      };
    }
  }
  function createModal() {
    const controller = new DeleteEvasionAccountControls(getUserIdFromAccountInfoURL());
    const submitButton = $('<button class="flex--item s-btn s-btn__filled s-btn__danger" type="button">Delete and Annotate</button>');
    submitButton.on("click", (ev) => {
      ev.preventDefault();
      controller.validateFields();
      void StackExchange.helpers.showConfirmModal({
        title: "Are you sure you want to delete this account?",
        body: "You will be deleting this account and placing an annotation on the main. This operation cannot be undone.",
        buttonLabelHtml: "I'm sure"
      }).then((res) => {
        if (res) {
          const { sockAccountId, deletionDetails } = controller.getDeletionDetails();
          const { mainAccountId, annotationDetails } = controller.getAnnotationDetails();
          handleDeleteUser(sockAccountId, deletionDetails).then(() => {
            return handleAnnotateUser(mainAccountId, annotationDetails);
          }).then(() => {
            window.location.reload();
            window.open(`/users/message/create/${mainAccountId}`, "_blank");
          }).catch((err) => {
            console.error(err);
          });
        }
      });
    });
    return $(`<aside class="s-modal s-modal__danger" id="${config.ids.modal}" tabindex="-1" role="dialog" aria-labelledby="${config.ids.modal}-title" aria-describedby="${config.ids.modal}-description" aria-hidden="false" data-controller="s-modal" data-s-modal-target="modal">`).append(
      $('<div class="s-modal--dialog" role="document">').append(`<h1 class="s-modal--header" id="${config.ids.modal}-title">Delete Ban Evasion Account</h1>`).append(
        $(`<div class="s-modal--body" id="${config.ids.modal}-description"></div>`).append(controller.getForm())
      ).append(
        $('<div class="d-flex gx8 s-modal--footer"></div>').append(submitButton).append('<button class="flex--item s-btn s-btn__muted" type="button" data-action="s-modal#hide">Cancel</button>')
      ).append(
        '<button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="@_s(&quot; Close&quot;)" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>'
      )
    );
  }
  function handleBanEvasionButtonClick(ev) {
    ev.preventDefault();
    const modal = document.getElementById(config.ids.modal);
    if (modal !== null) {
      Stacks.showModal(modal);
    } else {
      $("body").append(createModal());
    }
  }
  function main() {
    const link = $('<a href="#" role="button">delete ban evasion account</a>');
    link.on("click", handleBanEvasionButtonClick);
    $(".list.list-reset.mod-actions li:eq(3)").after(
      $("<li></li>").append(link)
    );
  }
  StackExchange.ready(() => {
    main();
  });
})();
