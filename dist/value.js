"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Value = void 0;
const React = require("react");
const styled_components_1 = require("styled-components");
const config_1 = require("./config");
const label_1 = require("./label");
const utils_1 = require("./utils");
const value_component_multi_1 = require("./value-component-multi");
const value_component_single_1 = require("./value-component-single");
const Button = styled_components_1.default.button `
    background: transparent;
    border: none;
    margin: 0;
    font-size: 20px;
    padding: 0;
    line-height: 1;
    cursor: pointer;

    &:focus {
        outline: none;
    }
`;
const ArrowButton = styled_components_1.default(Button) `
    font-size: 12px;
    color: ${() => config_1.ReactSlctColors.border};
    transform: translateY(2px);

    &:hover {
        color: #333;
    }
`;
const ValueContainer = styled_components_1.default.div `
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-height: 32px;
    pointer-events: ${(props) => props.mobile || props.disabled ? 'none' : 'auto'};
    padding: 5px 10px;
    background: #fff;
    cursor: default;
    border-width: 1px;
    border-style: solid;
    border-color: ${(props) => props.error ? config_1.ReactSlctColors.error : config_1.ReactSlctColors.border};
    z-index: 0;
    box-sizing: border-box;
    max-width: 100%;
    box-shadow: ${(props) => props.focused ? 'rgba(0, 0, 0, 0.15) 0 0 2px' : 'none'};
`;
const ValueLeft = styled_components_1.default.div `
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: ${(props) => props.multi && props.hasValue ? 'wrap' : 'nowrap'};
    user-select: none;
    min-width: 0;
    box-sizing: border-box;
    margin: ${(props) => props.multi && props.hasValue ? '-2px -5px' : 0};
`;
const ValueRight = styled_components_1.default.div `
    display: flex;
    align-items: center;
    margin-left: 4px;
    box-sizing: border-box;
`;
const Placeholder = styled_components_1.default(label_1.SelectLabel) `
    color: #aaa;
`;
const ClearButton = styled_components_1.default(Button) `
    margin-right: 6px;
`;
const ClearContainer = styled_components_1.default.span `
    color: ${() => config_1.ReactSlctColors.border};

    &:hover {
        color: #333;
    }
`;
const ClearX = () => React.createElement(ClearContainer, null, "\u00D7");
const Search = styled_components_1.default.span `
    min-width: 1px;
    margin-left: -1px;
    user-select: text;

    ${(props) => props.canSearch
    ? styled_components_1.css `
                  opacity: 1;
                  position: relative;
                  left: 1px;
              `
    : styled_components_1.css `
                  position: absolute;
                  opacity: 0;
              `}

    &:focus {
        outline: none;
    }
`;
class Value extends React.PureComponent {
    constructor(props) {
        super(props);
        this.blur = () => {
            if (this.search.current) {
                this.search.current.blur();
            }
        };
        this.onClick = () => {
            if (!this.props.disabled) {
                this.focus();
                this.props.onClick();
            }
        };
        this.onClear = (e) => {
            e.stopPropagation();
            this.props.onClear();
        };
        this.onSearch = (e) => {
            if (this.props.searchable) {
                this.props.onSearch(e.currentTarget.innerText.trim());
            }
            else {
                e.preventDefault();
            }
        };
        this.onKeyDown = (e) => {
            const { searchable } = this.props;
            if (e.metaKey) {
                return;
            }
            if ((!searchable && e.keyCode !== utils_1.keys.TAB) ||
                e.keyCode === utils_1.keys.ENTER ||
                e.keyCode === utils_1.keys.ARROW_UP ||
                e.keyCode === utils_1.keys.ARROW_DOWN) {
                e.preventDefault();
            }
        };
        this.search = React.createRef();
        const window = utils_1.getWindow();
        if (window) {
            window.addEventListener('blur', this.blur);
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.search && !this.props.search && this.search.current) {
            this.search.current.innerText = '';
        }
        if (prevProps.focused !== this.props.focused && this.props.focused) {
            this.focus();
        }
    }
    render() {
        const { options = [], value, disabled, clearable, open, mobile, multi, focused, equalCompareProp, error } = this.props;
        const ArrowComponent = this.props.arrowComponent;
        const ClearComponent = this.props.clearComponent || ClearX;
        const ValueIconComponent = this.props.valueIconComponent;
        const valueOptions = utils_1.getValueOptions(options, value, multi, equalCompareProp);
        const showClearer = Boolean(clearable && valueOptions.length && !mobile);
        const searchAtStart = !multi || valueOptions.length === 0;
        const searchAtEnd = multi && valueOptions.length > 0;
        return (React.createElement(ValueContainer, { "data-role": "value", className: "react-slct-value", disabled: disabled, mobile: mobile, focused: focused, error: error, onClick: this.onClick },
            React.createElement(ValueLeft, { className: "value-left", multi: multi, hasValue: !!valueOptions.length },
                ValueIconComponent && React.createElement(ValueIconComponent, null),
                searchAtStart && this.renderSearch(),
                this.renderValues(valueOptions),
                searchAtEnd && this.renderSearch()),
            React.createElement(ValueRight, { className: "value-right" },
                showClearer && (React.createElement(ClearButton, { type: "button", tabIndex: -1, className: "clearer", onClick: this.onClear },
                    React.createElement(ClearComponent, null))),
                ArrowComponent ? (React.createElement(ArrowComponent, { open: open })) : (React.createElement(ArrowButton, { type: "button", className: "arrow", tabIndex: -1 }, open ? '▲' : '▼')))));
    }
    renderSearch() {
        const { open, value, disabled, searchable, search, keepSearchOnBlur, onSearchFocus, onSearchBlur } = this.props;
        const canSearch = (open && searchable) ||
            (keepSearchOnBlur && !value && searchable) ||
            Boolean(search);
        if (disabled && !keepSearchOnBlur) {
            return null;
        }
        return (React.createElement(Search, { className: "search", contentEditable: true, canSearch: canSearch, onInput: this.onSearch, onKeyDown: this.onKeyDown, onFocus: onSearchFocus, onBlur: onSearchBlur, ref: this.search }));
    }
    renderValues(valueOptions) {
        const { placeholder, search, labelComponent, valueComponentSingle, valueComponentMulti, multi, open } = this.props;
        if (search && open && !multi) {
            return null;
        }
        if (valueOptions.length === 0 && !search) {
            return React.createElement(Placeholder, null, placeholder);
        }
        const Single = valueComponentSingle || value_component_single_1.ValueComponentSingle;
        const Multi = (valueComponentMulti || value_component_multi_1.ValueComponentMulti);
        return valueOptions.map((option) => multi ? (React.createElement(Multi, { key: utils_1.toKey(option.value, this.props.equalCompareProp), option: option, labelComponent: labelComponent, options: valueOptions, onRemove: this.props.onOptionRemove })) : (React.createElement(Single, { key: utils_1.toKey(option.value, this.props.equalCompareProp), option: option, labelComponent: labelComponent })));
    }
    focus() {
        const el = this.search.current;
        if (el) {
            el.focus();
            if (typeof window.getSelection != 'undefined' &&
                typeof document.createRange != 'undefined') {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(el);
                range.collapse(false);
                if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    }
}
exports.Value = Value;
//# sourceMappingURL=value.js.map