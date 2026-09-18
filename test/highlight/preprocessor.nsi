!if 1 == 0
; <- keyword.directive
!else if 1 == 1
; <- keyword.directive
;     ^ keyword.directive
!else ifdef DEBUG
;     ^ keyword.directive
!else ifndef DEBUG
;     ^ keyword.directive
!else ifmacrodef MyMacro
;     ^ keyword.directive
!else ifmacrondef MyMacro
;     ^ keyword.directive
!else IFDEF DEBUG
;     ^ keyword.directive
!else ifn DEBUG
; <- keyword.directive
!else
; <- keyword.directive
!endif
; <- keyword.directive
