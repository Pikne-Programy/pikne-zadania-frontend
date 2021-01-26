import * as Utils from '../helper/utils.js';
import * as ControllerUtils from '../helper/controller-utils.js';
import * as Model from './model.js';
import { getBasePath } from '../helper/tests/path-manager.js'

export class Controller {
    isAborted = false;
    contentReady = new Utils.Observable([], () => {
        const list = this.contentReady.get();
        if (list === null) {
            this.abort();
            ControllerUtils.toggleContentLoading(null)
        }
        else if (list.every((val) => { return val })) {
            MathJax.Hub.Queue([() => {
                adjustView(this.screenSize);
            }], ["Typeset", MathJax.Hub, 'math-panel'], [() => {
                $('.mjx-chtml').attr('tabIndex', '-1');
            }], [() => {
                if (!this.isAborted)
                    ControllerUtils.toggleContentLoading(false);
            }]);
        }
    });

    /**
     * Sets up view for Equation Exercise
     * @param {Model.EquationExercise} exercise Fetched EqEx exercise
     */
    constructor(exercise) {
        Model.startModel(exercise);
        const container = Utils.createElement('div');
        $(container).load(getBasePath() + '/eqex/eqex.html', () => {
            if (!this.isAborted) {
                bindView(container, this.contentReady);
                if (!this.isAborted) {
                    $('#content-container').empty();
                    $('#content-container').append($(container).children());
                    if (this.contentReady.get().length == 0)
                        this.contentReady.set([true]);
                }
            }
        });
        this.screenSize = Utils.getScreenSize();
        $(window).on('resize', () => {
            const newScreenSize = Utils.getScreenSize();
            if (this.screenSize != newScreenSize) {
                this.screenSize = newScreenSize;
                adjustView(this.screenSize);
            }
        });
    }

    abort() {
        this.isAborted = true;
    }
}

/**
 * Sets data according to the current EqEx
 * @param {HTMLElement} container View with fields for EqEx
 * @param {Utils.Observable} contentObserver Observable for images
 */
function bindView(container, contentObserver) {
    $(container).find('#ex-title').text(Model.exercise.name);
    $(container).find('#ex-content').text(Model.exercise.content);
    if (Model.exercise.imgs !== undefined) {
        const loadedImageList = [];
        Model.exercise.imgs.forEach(() => {
            loadedImageList.push(false);
        });
        contentObserver.set(loadedImageList);
        Model.exercise.imgs.forEach((url, i) => {
            $(container).find('#ex-image-container').append(createImage(url, i, contentObserver));
        });
    }
    Model.exercise.unknowns.forEach(unknown => {
        $(container).find('#ex-unknowns').append(createUnknown(unknown.name, unknown.unit));
    });
    const submitButton = $(container).find('#submit-button');
    submitButton.on('click', () => {
        submitButton.addClass('is-loading');
        let result = true;
        $('#ex-unknowns').find('input').each((i, element) => {
            ControllerUtils.clearInputVerifiedStated(element);
            if (Model.answerRegex.test(element.value))
                Model.exercise.unknowns[i].value = parseFloat(element.value.replace(',', '.'));
            else {
                result = false;
                return;
            }
        });
        if (result) {
            Model.sendAnswers((result) => {
                submitButton.removeClass('is-loading');
                //TODO Success for separate answers
                $('#ex-unknowns').find('input').each((_, input) => {
                    ControllerUtils.setInputVerifiedState(input, result.success);
                });
            });
        } else
            submitButton.removeClass('is-loading');
    });
}

/**
 * Appends view with an image
 * @param {string} url URL of the image
 * @param {number} i Index of the image in the container
 * @param {Utils.Observable} contentObserver Observable for images
 */
function createImage(url, i, contentObserver) {
    const img = Utils.createElement('img', ['img']);
    $(img).on('load', () => {
        const result = contentObserver.get();
        result[i] = true;
        contentObserver.set(result);
    });
    $(img).on('error', () => {
        contentObserver.set(null);
    });
    img.src = url;
    const figure = Utils.createElement('div', ['full-height', 'is-flex', 'is-align-items-center', 'is-justify-content-center'], [img]);
    const box = Utils.createElement('div', ['box', 'full-height', 'p-0'], [figure]);
    const column = Utils.createElement('div', ['column'], [box]);
    return column;
}

/**
 * Creates view for submitting an unknown
 * @param {string} name Name of the unknown
 * @param {string} unit Unit of the unknown
 */
function createUnknown(name, unit) {
    const input = Utils.createElement('input', ['input', 'is-primary']);
    const icon = Utils.createElement('i', ['fas', 'fa-exclamation-triangle']);
    const span = Utils.createElement('span', ['icon', 'is-small', 'is-right', 'has-text-warning'], [icon]);
    $(span).hide();
    const inputControl = Utils.createElement('div', ['control', 'has-icons-right'], [input, span]);
    const warningLabel = Utils.createElement('p', ['help', 'is-warning'], [], 'Wymagana liczba');
    Utils.setVisibility(warningLabel, 'hidden');
    const inputField = Utils.createElement('div', ['field'], [inputControl, warningLabel]);
    ControllerUtils.setInputChecking(Model.inputRegex, input, warningLabel);

    const nameLabel = Utils.createElement('div', ['subtitle', 'full-height', 'unknowns-width', 'is-flex', 'is-align-items-center', 'is-justify-content-right'], [], '\\(' + name + '=\\)');
    const unitLabel = Utils.createElement('div', ['subtitle', 'full-height', 'unknowns-width', 'is-flex', 'is-align-items-center'], [], '\\(' + unit + '\\)');

    const nameColumn = Utils.createElement('div', ['column', 'is-narrow', 'pb-5-5'], [nameLabel]);
    const inputColumn = Utils.createElement('div', ['column', 'px-0'], [inputField]);
    const unitColumn = Utils.createElement('div', ['column', 'is-narrow', 'pb-5-5'], [unitLabel]);

    const columns = Utils.createElement('div', ['columns', 'is-mobile'], [nameColumn, inputColumn, unitColumn]);
    const tile = Utils.createElement('div', ['tile', 'column', 'is-flex', 'is-justify-content-center', 'pt-0', 'pb-2'], [columns]);
    return tile;
}

/**
 * Adjusts view according to current screen size
 * @param {Utils.ScreenSize} screenSize 
 */
function adjustView(screenSize) {
    $(() => {
        const container = $('#content-container');
        if (screenSize == Utils.ScreenSize.MOBILE) {
            container.children('section').replaceClasses(['py-4'], ['p-3']);
            container.find('#ex-title').addClass('mb-3');
            container.find('#ex-content').replaceClasses(['mx-4', 'mb-5'], ['mx-1', 'mb-2']);
            container.find('#ex-unknowns').addClass('mb-0');
        } else {
            container.children('section').replaceClasses(['p-3'], ['py-4']);
            container.find('#ex-title').removeClass('mb-3');
            container.find('#ex-content').replaceClasses(['mx-1', 'mb-2'], ['mx-4', 'mb-5']);
            container.find('#ex-unknowns').removeClass('mb-0');
        }
    });
}