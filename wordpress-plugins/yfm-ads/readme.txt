=== YFM Ads ===
Contributors: yfm
Tags: headless, ads, affiliates, rest-api
Requires at least: 6.4
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later

Gerenciador de campanhas de afiliados para o frontend headless do YFM.

== Instalacao ==

1. Compacte a pasta `yfm-ads` em um ZIP.
2. No WordPress, acesse Plugins > Adicionar plugin > Enviar plugin.
3. Instale e ative o ZIP.
4. Acesse YFM Ads no menu administrativo.

== Uso ==

Crie uma campanha, informe a URL de afiliado, envie o criativo desktop, escolha as
posicoes e publique. Criativos mobile, periodo, peso e rotas sao opcionais.

O endpoint publico e:

`GET /wp-json/yfm-ads/v1/campaign?placement=cards_inline&path=/cartas/&device=desktop`

Quando nao houver campanha elegivel, a API responde com HTTP 204. Quando houver,
retorna a campanha selecionada, o criativo, a URL de destino e a identificacao
publicitaria. A selecao ponderada muda em janelas de dez minutos.

== Seguranca ==

A versao 0.1 aceita apenas imagens JPG, PNG, GIF, WebP e AVIF da biblioteca de
midia. HTML5 e ZIP nao sao aceitos ate que exista armazenamento em origem separada,
validacao de arquivos, CSP e iframe com sandbox.

== Changelog ==

= 0.1.0 =
* Cadastro, agendamento e segmentacao de campanhas.
* Criativos separados para desktop e mobile.
* Rotacao ponderada por posicao e rota.
* Endpoint REST publico com cache curto.
