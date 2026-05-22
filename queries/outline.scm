(function_definition
  "Function" @context
  name: (_) @name) @item

; Section "name" [index]
(section_definition
  "Section" @context
  . parameter: (string) @name) @item

; Section name
(section_definition
  "Section" @context
  . parameter: (identifier) @name) @item

; Section /o "name" [index]
(section_definition
  "Section" @context
  . parameter: (flag)
  . parameter: (string) @name) @item

; Section /o name
(section_definition
  "Section" @context
  . parameter: (flag)
  . parameter: (identifier) @name) @item

; Section (bare, no arguments)
(section_definition
  "Section" @name
  !parameter) @item

; SectionGroup "name"
(section_group
  "SectionGroup" @context
  . parameter: (string) @name) @item

; SectionGroup name
(section_group
  "SectionGroup" @context
  . parameter: (identifier) @name) @item

; SectionGroup /e "name"
(section_group
  "SectionGroup" @context
  . parameter: (flag)
  . parameter: (string) @name) @item

; SectionGroup /e name
(section_group
  "SectionGroup" @context
  . parameter: (flag)
  . parameter: (identifier) @name) @item

; !define NAME [value]
(preproc_directive
  directive: (preproc_keyword) @context
  (#eq? @context "!define")
  . argument: (identifier) @name) @item

; !define /flag NAME [value]
(preproc_directive
  directive: (preproc_keyword) @context
  (#eq? @context "!define")
  . argument: (flag)
  . argument: (identifier) @name) @item

(macro_definition
  "!macro" @context
  name: (identifier) @name) @item

(variable_declaration
  "Var" @context
  name: (identifier) @name) @item

(label
  name: (identifier) @name) @item
