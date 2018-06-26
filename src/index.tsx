import { bind } from 'lodash-decorators';
import * as React from 'react';
import styled from 'styled-components';
import { Value } from './value';
import { Options } from './options';
import { toString, isArray, keys } from './utils';
import { SelectProps, SelectState, Option, Rect } from './typings';

export class Select extends React.PureComponent<SelectProps, SelectState> {
    private static Container = styled.div`
        display: flex;
        position: relative;
        cursor: default;
        width: 100%;
        pointer-events: ${(props: { disabled?: boolean }) =>
            props.disabled ? 'none' : 'auto'};
        opacity: ${(props: { disabled?: boolean }) =>
            props.disabled ? 0.75 : 1};
    `;

    private static NativeSelect = styled.select`
        display: block;
        z-index: ${(props: { native?: boolean }) =>
            props.native ? '1' : 'auto'};
        opacity: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: 100%;
        height: 100%;
    `;

    private nativeSelect: React.RefObject<HTMLSelectElement>;
    private container: React.RefObject<HTMLDivElement>;
    private rect: Rect = { left: 0, top: 0, width: 0, height: 0 };

    constructor(props: SelectProps) {
        super(props);

        this.nativeSelect = React.createRef();
        this.container = React.createRef();

        this.state = {
            open: false
        };
    }

    private get options(): Option[] {
        const { search } = this.state;
        const { creatable } = this.props;
        let options = this.props.options;
        const showCreate =
            Boolean(creatable && search) &&
            !options.some(option => option.value === search);

        if (search) {
            options = options.filter(option =>
                option.label.toLowerCase().startsWith(search.toLowerCase())
            );
        }

        if (showCreate) {
            options = [
                { label: `Create "${search}"`, value: 'CREATE' },
                ...options
            ];
        }

        return options;
    }

    public componentWillUnmount(): void {
        this.removeDocumentListener();
    }

    public render(): React.ReactNode {
        const { Container } = Select;
        const {
            className,
            options,
            creatable,
            clearable,
            placeholder,
            value,
            disabled,
            labelComponent,
            multi,
            native
        } = this.props;
        const { open, search, selectedIndex } = this.state;
        const searchable = this.props.searchable || creatable;

        return (
            <Container
                className={className}
                disabled={disabled}
                innerRef={this.container}
                onKeyUp={this.onKeyUp}
                onKeyDown={this.onKeyDown}
            >
                {this.renderNativeSelect()}
                <Value
                    clearable={clearable}
                    searchable={searchable}
                    open={open}
                    multi={multi}
                    mobile={native}
                    options={options}
                    placeholder={placeholder}
                    value={value}
                    search={search}
                    labelComponent={labelComponent}
                    onClear={this.onClear}
                    onClick={this.toggleMenu}
                    onSearch={this.onSearch}
                    onSearchFocus={this.onSearchFocus}
                    onOptionRemove={this.onOptionRemove}
                />
                <Options
                    open={open}
                    options={this.options}
                    rect={this.rect}
                    value={value}
                    multi={multi}
                    search={search}
                    selectedIndex={selectedIndex}
                    labelComponent={labelComponent}
                    onSelect={this.onOptionSelect}
                />
            </Container>
        );
    }

    private renderNativeSelect(): React.ReactNode {
        const { NativeSelect } = Select;
        const { native, placeholder, multi, disabled } = this.props;
        const value = multi
            ? (this.props.value || []).map(val => toString(val))
            : toString(this.props.value || '');

        return (
            <NativeSelect
                innerRef={this.nativeSelect}
                multiple={multi}
                value={value}
                disabled={disabled}
                native={native}
                tabIndex={-1}
                onChange={this.onChangeNativeSelect}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {this.options.map(option => {
                    const value = toString(option.value);

                    return (
                        <option
                            disabled={option.disabled}
                            value={value}
                            key={value}
                        >
                            {option.label}
                        </option>
                    );
                })}
            </NativeSelect>
        );
    }

    @bind
    private toggleMenu(): void {
        const open = !this.state.open;

        if (open) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    private openMenu(): void {
        let selectedIndex = this.state.selectedIndex;

        if (this.container.current) {
            const rect = this.container.current.getBoundingClientRect();

            this.rect.left = rect.left;
            this.rect.top = rect.top;
            this.rect.width = rect.width;
            this.rect.height = rect.height;

            selectedIndex = this.options.findIndex(
                option => toString(option.value) === toString(this.props.value)
            );
        }

        this.setState({ open: true, search: undefined, selectedIndex }, () =>
            this.addDocumentListener()
        );
    }

    private closeMenu(callback = () => {}): void {
        this.removeDocumentListener();
        this.setState(
            {
                open: false,
                search: undefined,
                selectedIndex: undefined
            },
            callback
        );
    }

    private addDocumentListener(): void {
        if (typeof document !== 'undefined') {
            document.addEventListener('click', this.onDocumentClick);
        }
    }

    private removeDocumentListener(): void {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', this.onDocumentClick);
        }
    }

    @bind
    private onChangeNativeSelect(
        e: React.SyntheticEvent<HTMLSelectElement>
    ): void {
        const { onChange } = this.props;

        if (onChange) {
            const values = Array.from(e.currentTarget.selectedOptions).map(
                htmlOption => this.options[htmlOption.index - 1].value
            );

            onChange(values.length === 1 ? values[0] : values);
        }
    }

    @bind
    private onSearchFocus(): void {
        if (!this.state.open && !this.props.native) {
            this.openMenu();
        }
    }

    @bind
    private onOptionSelect(value: any | any[]): void {
        const { current } = this.nativeSelect;
        const { onChange } = this.props;

        if (current) {
            current.value = isArray(value)
                ? (value.map(val => toString(val)) as any)
                : toString(value);
        }

        this.closeMenu(() => onChange && onChange(value));
    }

    @bind
    private onOptionRemove(value: any): void {
        if (isArray(this.props.value)) {
            const values = this.props.value.filter(
                val => toString(val) !== toString(value)
            );

            this.onOptionSelect(values);
        }
    }

    @bind
    private onClear(): void {
        this.onOptionSelect(undefined);
    }

    @bind
    private onSearch(search: string): void {
        this.setState({ search }, () => {
            if (this.options.length === 1 || (this.props.creatable && search)) {
                this.setState({ selectedIndex: 0 });
            } else {
                this.setState({ selectedIndex: undefined });
            }
        });
    }

    @bind
    private onDocumentClick(): void {
        this.closeMenu();
    }

    @bind
    private onKeyDown({ keyCode }: React.KeyboardEvent): void {
        switch (keyCode) {
            case keys.TAB:
                if (this.state.open) {
                    this.closeMenu();
                }
                break;
        }
    }

    @bind
    private onKeyUp({ keyCode }: React.KeyboardEvent): void {
        const { search, open } = this.state;
        const { creatable, multi, value, onCreate } = this.props;
        let selectedIndex = this.state.selectedIndex;

        switch (keyCode) {
            case keys.ARROW_UP:
                if (open) {
                    if (selectedIndex !== undefined) {
                        selectedIndex = selectedIndex - 1;

                        if (selectedIndex < 0) {
                            selectedIndex = undefined;
                        }
                    }

                    this.setState({ selectedIndex });
                } else {
                    this.openMenu();
                }
                break;
            case keys.ARROW_DOWN:
                if (open) {
                    if (selectedIndex === undefined) {
                        selectedIndex = 0;
                    } else {
                        selectedIndex = selectedIndex + 1;
                    }

                    if (selectedIndex >= this.options.length) {
                        selectedIndex = undefined;
                    }

                    this.setState({ selectedIndex });
                } else {
                    this.openMenu();
                }
                break;
            case keys.ENTER:
                const isCreatable =
                    selectedIndex === 0 &&
                    creatable &&
                    this.options[0].value === 'CREATE';

                if (isCreatable && onCreate && search) {
                    this.closeMenu(() => onCreate(search));
                } else if (selectedIndex !== undefined) {
                    const newValue = this.options[selectedIndex].value;

                    this.onOptionSelect(
                        multi ? [...value, newValue] : newValue
                    );
                }
                break;
            case keys.ESC:
                if (open) {
                    this.closeMenu();
                }
                break;
        }
    }
}
