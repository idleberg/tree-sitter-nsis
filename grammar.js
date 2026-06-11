/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'nsis',

  extras: $ => [
    /[ \t\r]/,
    $.line_continuation,
    $.comment,
    $.block_comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [],

  rules: {
    source_file: $ => repeat($._toplevel),

    _toplevel: $ => choice(
      $.function_definition,
      $.section_definition,
      $.section_group,
      $.page_ex_block,
      $.macro_definition,
      $.preproc_conditional,
      $.statement,
      $.label,
      $._newline,
    ),

    _newline: _ => /\n/,

    // ── Block Definitions ──

    function_definition: $ => seq(
      alias(/function/i, 'Function'),
      field('name', $._value),
      $._newline,
      repeat($._body_item),
      alias(/functionend/i, 'FunctionEnd'),
    ),

    section_definition: $ => seq(
      alias(/section/i, 'Section'),
      repeat(field('parameter', $._value)),
      $._newline,
      repeat($._body_item),
      alias(/sectionend/i, 'SectionEnd'),
    ),

    section_group: $ => seq(
      alias(/sectiongroup/i, 'SectionGroup'),
      repeat(field('parameter', $._value)),
      $._newline,
      repeat(choice(
        $.section_definition,
        $.section_group,
        $.preproc_conditional,
        $.statement,
        $.label,
        $._newline,
      )),
      alias(/sectiongroupend/i, 'SectionGroupEnd'),
    ),

    page_ex_block: $ => seq(
      alias(/pageex/i, 'PageEx'),
      optional(field('type', $._value)),
      $._newline,
      repeat($._body_item),
      alias(/pageexend/i, 'PageExEnd'),
    ),

    macro_definition: $ => seq(
      alias(/!macro/i, '!macro'),
      field('name', $.identifier),
      repeat(field('parameter', $.identifier)),
      $._newline,
      repeat($._macro_body_item),
      alias(/!macroend/i, '!macroend'),
    ),

    _body_item: $ => choice(
      $.macro_definition,
      $.preproc_conditional,
      $.statement,
      $.label,
      $._newline,
    ),

    _macro_body_item: $ => choice(
      $.function_definition,
      $.section_definition,
      $.section_group,
      $.page_ex_block,
      $.macro_definition,
      $.preproc_conditional,
      $.statement,
      $.label,
      $._newline,
    ),

    // ── Preprocessor Conditionals ──

    preproc_conditional: $ => seq(
      field('keyword', alias(
        $._preproc_if_keyword,
        $.preproc_keyword,
      )),
      repeat($._value),
      $._newline,
      repeat($._body_item),
      repeat($.preproc_else),
      alias(/!endif/i, '!endif'),
    ),

    preproc_else: $ => seq(
      alias(/!else/i, '!else'),
      optional(seq(
        field('modifier', $.identifier),
        repeat($._value),
      )),
      $._newline,
      repeat($._body_item),
    ),

    _preproc_if_keyword: _ => choice(
      /!ifdef/i,
      /!ifndef/i,
      /!ifmacrodef/i,
      /!ifmacrondef/i,
      /!if/i,
    ),

    // ── Statements ──

    statement: $ => seq(
      choice(
        $.preproc_directive,
        $.plugin_call,
        $.variable_declaration,
        $.macro_invocation,
        $.command,
      ),
      $._newline,
    ),

    preproc_directive: $ => seq(
      field('directive', $.preproc_keyword),
      repeat(field('argument', $._value)),
    ),

    preproc_keyword: _ => choice(
      /!addincludedir/i,
      /!addplugindir/i,
      /!appendfile/i,
      /!assert/i,
      /!cd/i,
      /!define/i,
      /!delfile/i,
      /!echo/i,
      /!error/i,
      /!execute/i,
      /!finalize/i,
      /!getdllversion/i,
      /!gettlbversion/i,
      /!include/i,
      /!insertmacro/i,
      /!makensis/i,
      /!packhdr/i,
      /!pragma/i,
      /!searchparse/i,
      /!searchreplace/i,
      /!system/i,
      /!tempfile/i,
      /!undef/i,
      /!uninstfinalize/i,
      /!verbose/i,
      /!warning/i,
    ),

    macro_invocation: $ => prec.right(seq(
      field('name', $.define_reference),
      repeat(field('argument', $._value)),
    )),

    command: $ => prec.right(seq(
      field('name', $.identifier),
      repeat(field('argument', $._value)),
    )),

    plugin_call: $ => seq(
      field('plugin', $.identifier),
      token.immediate('::'),
      field('function', $.identifier),
      repeat(field('argument', $._value)),
    ),

    variable_declaration: $ => seq(
      alias(/var/i, 'Var'),
      optional($.flag),
      field('name', $.identifier),
    ),

    label: $ => seq(
      field('name', $.identifier),
      token.immediate(':'),
    ),

    // ── Values ──

    _value: $ => choice(
      $.string,
      $.raw_string,
      $.backtick_string,
      $.variable,
      $.define_reference,
      $.lang_string_reference,
      $.number,
      $.flag,
      $.label_reference,
      $.comparison_operator,
      $.pipe_operator,
      $.identifier,
    ),

    pipe_operator: _ => '|',

    label_reference: _ => /:[a-zA-Z_.][a-zA-Z0-9_.]*/,

    // ── Strings ──

    string: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $._interpolation,
      )),
      '"',
    ),

    raw_string: $ => seq(
      "'",
      repeat(choice(
        $.raw_string_content,
        $._interpolation,
      )),
      "'",
    ),

    backtick_string: $ => seq(
      '`',
      repeat(choice(
        $.backtick_string_content,
        $._interpolation,
      )),
      '`',
    ),

    _interpolation: $ => choice(
      $.variable,
      $.define_reference,
      $.lang_string_reference,
      $.escape_sequence,
    ),

    string_content: _ => prec(-1, /[^"\n$]+/),
    raw_string_content: _ => prec(-1, /[^'\n$]+/),
    backtick_string_content: _ => prec(-1, /[^`\n$]+/),

    escape_sequence: _ => token(choice(
      /\$\\./,
      '$$',
    )),

    // ── Variables & References ──

    variable: _ => /\$([a-zA-Z_]\w*|[0-9])/,

    define_reference: _ => /\$\{[\!\w\.:\^-]+\}/,

    lang_string_reference: _ => /\$\([\!\w\.:\^-]+\)/,

    // ── Literals ──

    number: _ => /[+-]?[0-9]+(\.[0-9]+)?|0[xX][0-9a-fA-F]+/,

    flag: _ => /\/[a-zA-Z_]\w*(=[^\s]*)?/,

    comparison_operator: _ => choice('=', '!=', '<>', '<', '>'),

    identifier: _ => /[a-zA-Z_.][a-zA-Z0-9_.]*/,

    // ── Comments & Whitespace ──

    comment: _ => token(seq(/[;#]/, /[^\n]*/)),

    block_comment: _ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),

    line_continuation: _ => token(seq('\\', /\r?\n/)),
  },
});
