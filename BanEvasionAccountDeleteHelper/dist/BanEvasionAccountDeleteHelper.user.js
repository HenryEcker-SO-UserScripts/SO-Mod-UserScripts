// ==UserScript==
// @name         Ban Evasion Account Delete Helper
// @description  Adds streamlined interface for deleting evasion accounts, then annotating and messaging the main accounts
// @homepage     https://github.com/HenryEcker/SO-Mod-UserScripts
// @author       Henry Ecker (https://github.com/HenryEcker)
// @version      0.1.0
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
  function getFormDataFromObject(obj) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc.set(key, value);
      return acc;
    }, new FormData());
  }
  function fetchPostFormData(endPoint, data) {
    return fetch(endPoint, {
      method: "POST",
      body: getFormDataFromObject(data)
    });
  }
  function getUserPii(userId) {
    return fetchPostFormData(
      "/admin/all-pii",
      { id: userId, fkey: StackExchange.options.user.fkey }
    ).then((res) => res.text()).then((resText) => {
      const html = $(resText);
      return {
        email: html[1].children[1].innerText.trim(),
        name: html[1].children[3].innerText.trim(),
        ip: html[3].children[1].innerText.trim()
      };
    });
  }
  function deleteUser(userId, deleteReason, deleteReasonDetails) {
    return fetchPostFormData(
      `/admin/users/${userId}/delete`,
      {
        fkey: StackExchange.options.user.fkey,
        deleteReason,
        deleteReasonDetails
      }
    );
  }
  function annotateUser(userId, annotationDetails) {
    return fetchPostFormData(
      `/admin/users/${userId}/annotate`,
      {
        fkey: StackExchange.options.user.fkey,
        annotation: annotationDetails
      }
    );
  }
  const config = {
    ids: {
      modal: "beadh-modal",
      mainAccountIdInput: "beadh-main-account-id-input",
      deletionReason: "beadh-delete-reason",
      deleteReasonDetails: "beadh-deleteReasonDetails",
      annotationDetails: "beadh-mod-menu-annotation",
      openMessageUser: "beadh-message-user-checkbox"
    },
    data: {
      controller: "ban-evasion-form",
      target: {
        mainAccountIdInput: "main-account-id",
        mainAccountIdInputButton: "main-account-id-button",
        formElements: "form-elements",
        deletionReasonSelect: "delete-reason",
        deletionDetails: "delete-reason-detail-text",
        annotationDetails: "annotation-detail-text",
        openMessageUser: "message-user-checkbox",
        controllerSubmitButton: "submit-actions-button"
      },
      action: {
        lookupMainAccountId: "lookupMain",
        handleSubmitActions: "handleSubmitActions",
        handleCancelActions: "handleCancelActions"
      }
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
    },
    supportedDeleteOptions: {
      "Ban evasion": "This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly",
      "No longer welcome": "This user is no longer welcome to participate on the site"
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
  function handleDeleteUser(userId, deletionReason, deletionDetails) {
    return deleteUser(
      userId,
      deletionReason,
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
  function handleDeleteAndAnnotateUsers(sockAccountId, deletionReason, deletionDetails, mainAccountId, annotationDetails) {
    return handleDeleteUser(sockAccountId, deletionReason, deletionDetails).then(() => handleAnnotateUser(mainAccountId, annotationDetails));
  }
  function createModal() {
    return $(`<aside class="s-modal s-modal__danger" id="${config.ids.modal}" tabindex="-1" role="dialog" aria-labelledby="${config.ids.modal}-title" aria-describedby="${config.ids.modal}-description" aria-hidden="false" data-controller="s-modal" data-s-modal-target="modal">
    <div class="s-modal--dialog" role="document" data-controller="${config.data.controller}">
        <h1 class="s-modal--header" id="${config.ids.modal}-title">Delete Ban Evasion Account</h1>
        <div class="s-modal--body" id="${config.ids.modal}-description">
            <div class="d-flex fd-column g12 mx8" data-${config.data.controller}-target="${config.data.target.formElements}">
                <div class="d-flex fd-row g4 jc-space-between ai-center">
                    <label class="s-label" for="${config.ids.mainAccountIdInput}" style="min-width:fit-content;">Enter Id For Main Account: </label>
                    <input data-${config.data.controller}-target="${config.data.target.mainAccountIdInput}" class="s-input" type="number" id="${config.ids.mainAccountIdInput}">
                    <button data-${config.data.controller}-target="${config.data.target.mainAccountIdInputButton}" class="s-btn s-btn__primary" type="button" style="min-width:max-content;" data-action="${config.data.controller}#${config.data.action.lookupMainAccountId}">Resolve User URL</button>
                </div>
            </div>
        </div>
        <div class="d-flex gx8 s-modal--footer">
            <button class="s-btn flex--item s-btn__filled s-btn__danger" type="button" data-${config.data.controller}-target="${config.data.target.controllerSubmitButton}" data-action="click->${config.data.controller}#${config.data.action.handleSubmitActions}" disabled>Delete and Annotate</button>
            <button class="s-btn flex--item s-btn__muted" type="button" data-action="click->${config.data.controller}#${config.data.action.handleCancelActions}">Cancel</button>
        </div>
        <button class="s-modal--close s-btn s-btn__muted" type="button" aria-label="Close" data-action="s-modal#hide"><svg aria-hidden="true" class="svg-icon iconClearSm" width="14" height="14" viewBox="0 0 14 14"><path d="M12 3.41 10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7 12 3.41Z"></path></svg></button>
    </div>
</aside>`);
  }
  function buildDetailStringFromObject(obj, keyValueSeparator, recordSeparator, alignColumns = false) {
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
  function validateLength(label, s, bounds) {
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
  function getTargetPropKey(s) {
    return `${s}Target`;
  }
  const banEvasionControllerConfiguration = {
    targets: [
      ...Object.values(config.data.target)
      // Establishes access to all targets
    ],
    initialize() {
      this.sockAccountId = getUserIdFromAccountInfoURL();
    },
    get mainAccountId() {
      return Number($(this[getTargetPropKey(config.data.target.mainAccountIdInput)]).val());
    },
    get deletionReason() {
      return $(this[getTargetPropKey(config.data.target.deletionReasonSelect)]).val();
    },
    get deletionDetails() {
      return $(this[getTargetPropKey(config.data.target.deletionDetails)]).val();
    },
    get annotationDetails() {
      return $(this[getTargetPropKey(config.data.target.annotationDetails)]).val();
    },
    get openMessageUser() {
      return $(this[getTargetPropKey(config.data.target.openMessageUser)]).prop("checked");
    },
    get fields() {
      return {
        sockAccountId: this.sockAccountId,
        deletionReason: this.deletionReason,
        deletionDetails: this.deletionDetails,
        mainAccountId: this.mainAccountId,
        annotationDetails: this.annotationDetails,
        shouldMessageAfter: this.openMessageUser
      };
    },
    validateFields() {
      validateLength("Deletion reason details", this.deletionDetails, config.validationBounds.deleteReasonDetails);
      validateLength("Annotation details", this.annotationDetails, config.validationBounds.annotationDetails);
    },
    [config.data.action.handleSubmitActions](ev) {
      ev.preventDefault();
      this.validateFields();
      void StackExchange.helpers.showConfirmModal({
        title: "Are you sure you want to delete this account?",
        body: "You will be deleting this account and placing an annotation on the main. This operation cannot be undone.",
        buttonLabelHtml: "I'm sure"
      }).then((actionConfirmed) => {
        if (!actionConfirmed) {
          return;
        }
        const {
          sockAccountId,
          deletionReason,
          deletionDetails,
          mainAccountId,
          annotationDetails,
          shouldMessageAfter
        } = this.fields;
        handleDeleteAndAnnotateUsers(sockAccountId, deletionReason, deletionDetails, mainAccountId, annotationDetails).then(() => {
          if (shouldMessageAfter) {
            window.open(`/users/message/create/${mainAccountId}`, "_blank");
          }
          window.location.reload();
        }).catch((err) => {
          console.error(err);
        });
      });
    },
    [config.data.action.handleCancelActions](ev) {
      ev.preventDefault();
      document.getElementById(config.ids.modal).remove();
    },
    [config.data.action.lookupMainAccountId](ev) {
      ev.preventDefault();
      if (this.mainAccountId === this.sockAccountId) {
        StackExchange.helpers.showToast("Cannot enter current account ID in parent field.", {
          type: "danger",
          transientTimeout: 3e3
        });
        return;
      }
      $(this[getTargetPropKey(config.data.target.mainAccountIdInput)]).prop("disabled", true);
      $(this[getTargetPropKey(config.data.target.mainAccountIdInputButton)]).prop("disabled", true);
      void this.buildRemainingFormElements();
    },
    async buildRemainingFormElements() {
      const [mainUrl, sockUrl, { email: sockEmail, name: sockRealName }] = await Promise.all([
        fetchFullUrlFromUserId(this.mainAccountId),
        fetchFullUrlFromUserId(this.sockAccountId),
        getUserPii(this.sockAccountId)
      ]);
      const deletionDetails = `

${buildDetailStringFromObject({
        "Main Account": mainUrl,
        "Email": sockEmail,
        "Real name": sockRealName
      }, ":  ", "\n", true)}`;
      const annotationDetails = buildDetailStringFromObject({
        "Deleted evasion account": sockUrl,
        "Email": sockEmail,
        "Real name": sockRealName
      }, ": ", " | ");
      $(this[getTargetPropKey(config.data.target.formElements)]).append(
        $(`<div class="d-flex fd-row g6">
                <label class="s-label">Main account located here:</label>
                <a href="${mainUrl}" target="_blank">${mainUrl}</a>
            </div>
            <div class="d-flex gy4 fd-column">
                <label class="s-label" for="${config.ids.deletionReason}">Reason for deleting this user:</label>
                <div class="flex--item s-select">
                    <select id="${config.ids.deletionReason}" data-${config.data.controller}-target="${config.data.target.deletionReasonSelect}">
                        <option value="This user was created to circumvent system or moderator imposed restrictions and continues to contribute poorly">Ban evasion</option>
                        <option value="This user is no longer welcome to participate on the site">No longer welcome</option>
                    </select>
                </div>
            </div>
            <div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="15" data-se-char-counter-max="600">
                <label class="s-label flex--item" for="${config.ids.deleteReasonDetails}">Please provide details leading to the deletion of this account (required):</label>
                <textarea style="font-family:monospace" 
                          class="flex--item s-textarea" 
                          data-se-char-counter-target="field" 
                          data-is-valid-length="false"
                          id="${config.ids.deleteReasonDetails}" 
                          name="deleteReasonDetails" 
                          placeholder="Please provide at least a brief explanation of what this user has done; this will be logged with the action and may need to be referenced later." 
                          rows="6" 
                          data-${config.data.controller}-target="${config.data.target.deletionDetails}">${deletionDetails}</textarea>
                <div data-se-char-counter-target="output" class="cool"></div>
            </div>
            <div class="d-flex ff-column-nowrap gs4 gsy" data-controller="se-char-counter" data-se-char-counter-min="10" data-se-char-counter-max="300">
                <label class="s-label flex--item" for="${config.ids.annotationDetails}">Annotate the main account (required): </label>
                <textarea style="font-family:monospace" 
                          class="flex--item s-textarea" 
                          data-se-char-counter-target="field" 
                          data-is-valid-length="false" 
                          id="${config.ids.annotationDetails}" 
                          name="annotation" 
                          placeholder="Examples: &amp;quot;possible sock of /users/XXXX, see mod room [link] for discussion&amp;quot; or &amp;quot;left a series of abusive comments, suspend on next occurrence&amp;quot;" 
                          rows="4" 
                          data-${config.data.controller}-target="${config.data.target.annotationDetails}">${annotationDetails}</textarea>
                <div data-se-char-counter-target="output" class="cool"></div>
            </div>
            <div class="d-flex fd-row">
                <div class="s-check-control">
                    <input class="s-checkbox" 
                           type="checkbox" 
                           id="${config.ids.openMessageUser}" 
                           checked 
                           data-${config.data.controller}-target="${config.data.target.openMessageUser}">
                    <label class="s-label" for="${config.ids.openMessageUser}">Open message user in new tab</label>
                </div>
            </div>`)
      );
      $(this[getTargetPropKey(config.data.target.controllerSubmitButton)]).prop("disabled", false);
    }
  };
  function handleBanEvasionButtonClick(ev) {
    ev.preventDefault();
    const modal = document.getElementById(config.ids.modal);
    if (modal !== null) {
      Stacks.showModal(modal);
    } else {
      $("body").append(createModal());
      Stacks.addController(config.data.controller, banEvasionControllerConfiguration);
    }
  }
  function main() {
    const link = $('<a href="#" role="button">delete ban evasion account</a>');
    link.on("click", handleBanEvasionButtonClick);
    $(".list.list-reset.mod-actions li:eq(3)").after(
      $("<li></li>").append(link)
    );
  }
  StackExchange.ready(main);
})();
