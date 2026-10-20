"""New source-aligned cases; partial/final models must never share stems."""
import random, copy

def parse(text):
 result=[]
 for line in text.strip().splitlines():
  fields=line.split('|');assert len(fields)==6,fields
  p,c,*rest=fields
  result.append(dict(prompt=p,options=[c,*rest[:3]],answer=0,explanation=rest[3]))
 return result

def shuffled(rows,seed):
 rows=copy.deepcopy(rows);rng=random.Random(seed);rng.shuffle(rows)
 for q in rows:
  correct=q['options'][q['answer']];rng.shuffle(q['options']);q['answer']=q['options'].index(correct)
 return rows

ECONOMY=[r'''
Una estudiante paga 120 € por un seminario y renuncia a un turno remunerado con 80 €. No hay otros costes relevantes. ¿Cuál es el coste de oportunidad total de asistir?|200 €|120 €|80 €|40 €|Incluye el desembolso de 120 € y el valor de la mejor alternativa sacrificada, 80 €.
Una fábrica vierte residuos y no compensa los daños causados a los vecinos. Señale la afirmación CORRECTA.|El coste social de producción supera al coste privado|El coste privado incluye necesariamente todos los daños|El daño constituye un beneficio marginal privado|No existe externalidad porque los vecinos no compran el producto|El daño a terceros no compensado es una externalidad negativa de producción.
¿Cuál de estas situaciones contradice el modelo de competencia perfecta?|Una patente impide la entrada de nuevos oferentes|Cada empresa acepta el precio de mercado|Los compradores disponen de información del producto|El producto de los distintos oferentes es homogéneo|La libertad de entrada es una condición del modelo; la patente introduce una barrera.
La renta disminuye y la vivienda vacacional es un bien normal. Con oferta creciente y constante, ¿qué ocurre con el equilibrio de este mercado?|Disminuyen el precio y la cantidad intercambiada|Aumentan el precio y la cantidad intercambiada|Disminuye el precio y aumenta la cantidad|Aumenta el precio y disminuye la cantidad|La caída de renta desplaza la demanda a la izquierda; no desplaza la oferta.
Los salarios del sector cerámico bajan sin variar su productividad ni la demanda del producto. Con oferta creciente y demanda decreciente, el nuevo equilibrio presenta:|Menor precio y mayor cantidad intercambiada|Mayor precio y menor cantidad intercambiada|Menor precio y menor cantidad intercambiada|Mayor precio y mayor cantidad intercambiada|La reducción del coste de los factores desplaza la oferta a la derecha.
Disminuye la renta de los consumidores de un bien normal y, simultáneamente, bajan sus costes de producción. Con curvas de oferta creciente y demanda decreciente, ¿qué efecto es inequívoco?|Disminuye el precio de equilibrio|Aumenta la cantidad de equilibrio|Disminuye necesariamente la cantidad de equilibrio|Aumenta el precio de equilibrio|La demanda se desplaza a la izquierda y la oferta a la derecha; ambas reducen el precio, pero sus efectos sobre la cantidad se oponen.
Los bienes X e Y son sustitutivos. Si aumenta el precio de X, sin otros cambios, en el mercado de Y:|La demanda se desplaza a la derecha|La oferta se desplaza a la izquierda|Se reduce la demanda|Solo se produce un movimiento a lo largo de la demanda de Y|El precio del sustituto es un determinante de la demanda de Y, no su propio precio.
En un mercado, Qd = 180 − 2P y Qs = 20 + 2P. Tras un cambio pasan a Qd = 220 − 2P y Qs = 40 + 2P. ¿Cuál es el nuevo equilibrio?|P = 45; Q = 130|P = 40; Q = 100|P = 50; Q = 120|P = 35; Q = 110|220 − 2P = 40 + 2P: P = 45 y Q = 130. Antes P = 40 y Q = 100.
X es un bien inferior. Su precio y los precios de los demás bienes no cambian, pero aumenta la renta. Seleccione la afirmación correcta.|La demanda de X disminuye|La cantidad demandada aumenta por definición|La curva de oferta de X se desplaza necesariamente|El carácter inferior implica que X tiene mala calidad|La clasificación inferior se refiere a la relación negativa entre renta y demanda, no a calidad.
El precio de un bien sube de 40 a 44 € y la cantidad demandada baja de 100 a 80 unidades, ceteris paribus. Usando variaciones respecto al valor inicial, la elasticidad-precio en valor absoluto es:|2|0,5|0,2|4|La cantidad cae un 20 % y el precio aumenta un 10 %: 20/10 = 2.
La elasticidad cruzada de la demanda de A respecto al precio de B es −0,6. Un aumento del precio de B del 5 % implica, aproximadamente y ceteris paribus:|Una caída del 3 % en la cantidad demandada de A|Un aumento del 3 % en la cantidad demandada de A|Una caída del 8,3 % en el precio de A|Un aumento del 5,6 % en la cantidad demandada de A|−0,6 × 5 % = −3 %. La relación cruzada negativa identifica bienes complementarios.
Una mejora tecnológica reduce el coste de producir bicicletas. ¿Qué cambio representa correctamente su efecto, manteniendo la demanda constante?|Desplazamiento de la oferta a la derecha|Movimiento sobre la oferta provocado por un mayor precio|Desplazamiento de la demanda a la derecha|Desplazamiento de la oferta a la izquierda|A cada precio se puede ofrecer más cantidad; el cambio es de oferta.
El precio pasa de 50 a 55 € y la cantidad vendida de 100 a 96 unidades. ¿Cómo cambia el ingreso total del vendedor?|Aumenta de 5.000 a 5.280 €|Disminuye de 5.000 a 4.800 €|Permanece en 5.000 €|Aumenta de 5.000 a 5.500 €|IT = P × Q: 50 × 100 = 5.000; 55 × 96 = 5.280. La caída de cantidad no compensa el alza de precio.
El precio sube un 4 % y la cantidad ofrecida aumenta un 6 %, sin desplazarse la oferta. Su elasticidad-precio, calculada con estos porcentajes, es:|1,5; oferta elástica|0,67; oferta inelástica|2; oferta unitaria|0,24; oferta inelástica|Elasticidad de oferta = 6/4 = 1,5; supera la unidad.
El precio baja de 20 a 18 € y las ventas aumentan de 100 a 120 unidades. ¿Cuál es el cambio exacto del ingreso total?|Aumenta un 8 %|Aumenta un 10 %|Disminuye un 8 %|Permanece constante|El ingreso pasa de 2.000 a 2.160 €; 160/2.000 = 8 %.
La oferta de entradas de una sala está fijada en 800 localidades y no puede ampliarse. Si aumenta la demanda, con demanda decreciente, el nuevo equilibrio libre presenta:|Un precio mayor y 800 entradas intercambiadas|El mismo precio y más de 800 entradas|Un precio menor y 800 entradas|Un precio mayor y menos de 800 entradas|La oferta es vertical: el ajuste de equilibrio se realiza por el precio.
Una consumidora está dispuesta a pagar 75 € por una entrada y la compra por 52 €. ¿Cuál es su excedente del consumidor en esa compra?|23 €|52 €|75 €|127 €|La disposición máxima a pagar menos el precio efectivamente pagado es 75 − 52 = 23 €.
Para una unidad adicional, el precio recibido es 48 € y el coste marginal 31 €. ¿Qué excedente del productor aporta esa unidad?|17 €|31 €|48 €|79 €|El excedente marginal es precio menos coste marginal: 48 − 31 = 17 €.
A un precio máximo legal de 8 €, inferior al de equilibrio, se demandan 140 unidades y se ofrecen 90. Sin mercado negro, ¿qué desequilibrio existe?|Escasez de 50 unidades|Excedente de 50 unidades|Escasez de 230 unidades|Equilibrio de 115 unidades|El exceso de demanda es Qd − Qs = 140 − 90 = 50.
Un precio mínimo legal de 15 €, superior al de equilibrio, da lugar a Qs = 180 y Qd = 120. Sin compras públicas, ¿cuántas unidades quedan sin vender?|60 unidades|120 unidades|180 unidades|300 unidades|El exceso de oferta es 180 − 120 = 60 unidades.
''',r'''
Un comercio ya pagó 600 € por un estudio no reembolsable. Ahora un pedido aporta 900 € de ingresos y exige 650 € de nuevos costes. Sin otras consecuencias, ¿qué efecto tiene aceptarlo sobre el beneficio respecto a rechazarlo?|Aumenta en 250 €|Disminuye en 350 €|Aumenta en 900 €|Disminuye en 600 €|Los 600 € son un coste hundido común a ambas alternativas; el beneficio incremental es 900 − 650 = 250 €.
Un programa redistribuye renta hacia hogares vulnerables, pero reduce la producción total por sus costes de gestión. ¿Qué distinción ilustra?|Una posible disyuntiva entre equidad y eficiencia|La identidad entre equidad y eficiencia|Una mejora necesaria de la eficiencia productiva|La imposibilidad de cualquier redistribución|Distribución y aprovechamiento de recursos son criterios diferentes; una medida puede mejorar uno y empeorar el otro.
Una pequeña empresa vende trigo homogéneo en un mercado perfectamente competitivo. Si intenta cobrar más que el precio de mercado por el mismo producto, lo esperable es que:|Los compradores acudan a otros oferentes|Pueda imponer el nuevo precio al conjunto del mercado|Todos sus competidores tengan que salir inmediatamente|Su demanda individual siga siendo la misma a cualquier precio|Una empresa precio-aceptante no puede imponer un precio superior para un producto idéntico.
La renta sube y aumenta la demanda de viajes de ocio. Con oferta creciente y sin otros cambios, en el nuevo equilibrio:|Aumentan el precio y la cantidad intercambiada|Aumenta el precio y disminuye la cantidad|Disminuyen el precio y la cantidad|Disminuye el precio y aumenta la cantidad|El aumento de renta de un bien normal desplaza su demanda a la derecha.
Aumenta el precio de la energía utilizada para fabricar vidrio. Con demanda decreciente e inalterada y oferta creciente, el efecto sobre el equilibrio es:|Mayor precio y menor cantidad intercambiada|Menor precio y mayor cantidad intercambiada|Mayor precio y mayor cantidad intercambiada|Menor precio y menor cantidad intercambiada|El aumento del coste de los factores desplaza la oferta a la izquierda.
Aumentan simultáneamente la renta de los compradores de un bien normal y sus costes de producción. Con curvas habituales, sin conocer la magnitud de ambos desplazamientos:|El precio aumenta, pero el cambio de cantidad es indeterminado|La cantidad aumenta, pero el cambio de precio es indeterminado|Disminuyen siempre el precio y la cantidad|El precio disminuye y la cantidad aumenta|Demanda a la derecha y oferta a la izquierda elevan el precio; sus efectos sobre cantidad son opuestos.
Impresoras y cartuchos son complementarios. Si baja el precio de las impresoras, manteniéndose los demás factores constantes, en el mercado de cartuchos:|Aumenta la demanda, sin que por ello tenga que desplazarse su oferta|Disminuye la demanda|Se desplaza únicamente la oferta a la derecha|Disminuye necesariamente la cantidad de equilibrio|El abaratamiento del bien complementario aumenta la demanda del otro.
Inicialmente Qd = 240 − 3P y Qs = 40 + P. Después pasan a Qd = 200 − 3P y Qs = 60 + P. El nuevo equilibrio es:|P = 35; Q = 95|P = 50; Q = 90|P = 40; Q = 80|P = 30; Q = 110|200 − 3P = 60 + P: P = 35 y Q = 95. Antes P = 50 y Q = 90.
La renta baja un 8 % y la cantidad demandada de X aumenta un 4 %, sin otros cambios. ¿Qué valor tiene su elasticidad-renta y cómo se clasifica X?|−0,5; bien inferior|0,5; bien normal|−2; bien inferior|2; bien normal|4/(−8) = −0,5. La elasticidad-renta negativa identifica un bien inferior.
El precio baja de 80 a 72 € y la cantidad demandada sube de 200 a 230 unidades. Usando los valores iniciales como base, la elasticidad-precio en valor absoluto es:|1,5|0,67|2,5|0,15|El precio cae un 10 % y la cantidad aumenta un 15 %: 15/10 = 1,5.
Al subir el precio del café un 10 %, la cantidad demandada de té aumenta un 4 %, ceteris paribus. ¿Qué relación muestra la elasticidad cruzada calculada con esos porcentajes?|0,4; bienes sustitutivos|−0,4; bienes complementarios|2,5; bienes sustitutivos|−2,5; bienes inferiores|La elasticidad cruzada es 4/10 = 0,4; su signo positivo indica sustitución.
¿Cuál de las siguientes variaciones produce un movimiento a lo largo de la curva de oferta de pan, manteniéndose sus demás determinantes constantes?|Un aumento del precio del propio pan|Una caída del salario de los panaderos|Una mejora del horno utilizado|Una reducción del precio de la harina|Solo el precio del propio bien genera un movimiento sobre la curva; los demás cambios desplazan la oferta.
El precio de un producto baja un 8 % y la cantidad demandada aumenta un 3 %, manteniéndose los demás factores constantes. ¿Cómo cambia exactamente el ingreso total?|Disminuye un 5,24 %|Aumenta un 5 %|Disminuye un 5 % exactamente|Aumenta un 11,24 %|El nuevo ingreso es 0,92 × 1,03 = 0,9476 del inicial: cae un 5,24 %.
Durante un año, una subida del precio del 10 % aumenta la cantidad ofrecida un 5 %. Con los demás factores constantes, la oferta en ese intervalo es:|Inelástica, con elasticidad 0,5|Elástica, con elasticidad 2|Perfectamente inelástica, con elasticidad 0|Unitaria, con elasticidad 1|La respuesta porcentual de cantidad dividida por la de precio es 5/10 = 0,5.
Una empresa vende 300 unidades a 30 €. Después vende 345 unidades a 27 €. ¿Qué afirmación sobre el ingreso total es correcta?|Aumenta de 9.000 a 9.315 €|Disminuye de 9.000 a 8.100 €|Aumenta exactamente un 5 %|Permanece en 9.000 €|El nuevo ingreso es 345 × 27 = 9.315 €, un 3,5 % superior al inicial.
La oferta de suelo en una zona delimitada es vertical. Si disminuye la demanda y no hay intervención, con demanda decreciente:|Disminuye el precio y no cambia la cantidad de equilibrio|Aumenta el precio y no cambia la cantidad|Disminuye la cantidad y no cambia el precio|Aumentan el precio y la cantidad|Con cantidad ofrecida fija, una contracción de demanda reduce el precio de equilibrio.
Una compradora adquiere dos unidades al precio de 12 € cada una. Su disposición máxima a pagar es de 20 € por la primera y 15 € por la segunda. ¿Cuál es su excedente total?|11 €|8 €|35 €|24 €|El excedente total es (20 − 12) + (15 − 12) = 11 €.
Un vendedor recibe 25 € por cada una de dos unidades cuyos costes marginales son 14 y 18 €. El excedente del productor conjunto es:|18 €|32 €|50 €|7 €|El excedente es (25 − 14) + (25 − 18) = 18 €.
El equilibrio competitivo de un mercado es P = 12 €. Se establece un precio máximo de 15 €, sin otros cambios. ¿Qué sucede?|El máximo no es vinculante y el equilibrio permanece en 12 €|El precio debe subir a 15 €|Aparece necesariamente exceso de demanda|Desaparece la oferta|Un máximo superior al precio de equilibrio no impide alcanzar el equilibrio competitivo.
Con Qd = 200 − 5P y Qs = 20 + 5P, se impone un precio mínimo de 20 €. Sin compras públicas, ¿cuál es el exceso de oferta?|20 unidades|100 unidades|120 unidades|0 unidades|A P = 20, Qd = 100 y Qs = 120. El mínimo supera el precio de equilibrio de 18 €: sobran 20 unidades.
''',r'''
Una empresa puede producir 10 unidades adicionales con un ingreso extra de 500 € y un coste extra de 540 €. Los costes fijos no varían. Desde el análisis marginal, debe:|Rechazar el pedido porque reduce el beneficio en 40 €|Aceptarlo porque cualquier ingreso aumenta el beneficio|Aceptarlo porque el ingreso medio es positivo|Rechazarlo porque los costes fijos siempre son evitables|La variación de beneficio es ingreso adicional menos coste adicional: 500 − 540 = −40 €.
La vacunación de una persona reduce el riesgo de contagio de otras que no pagan por ello. ¿Qué afirmación identifica correctamente este efecto?|El beneficio social puede superar al beneficio privado|El coste privado supera necesariamente al coste social|Se trata de poder de mercado del vacunado|Es un coste hundido de los terceros|Existe un beneficio sobre terceros no recogido íntegramente en la decisión privada: externalidad positiva.
Señale la afirmación FALSA sobre un mercado perfectamente competitivo.|Cada vendedor puede fijar su precio sin perder compradores|Existen numerosos compradores y vendedores|El producto se considera homogéneo|Los agentes son precio-aceptantes|El poder individual para fijar precios contradice la competencia perfecta.
Una caída de renta aumenta la demanda de una marca económica de conservas. Con oferta creciente y constante, ¿qué ocurre y qué tipo de bien es?|Suben precio y cantidad; bien inferior|Bajan precio y cantidad; bien normal|Sube el precio y baja la cantidad; bien inferior|Baja el precio y sube la cantidad; bien normal|La demanda se desplaza a la derecha al caer la renta: el bien es inferior.
Una nueva técnica permite producir paneles con menos material por unidad. La demanda no varía. Con oferta creciente y demanda decreciente, el nuevo equilibrio presenta:|Una disminución del precio y un aumento de la cantidad|Un aumento del precio y una disminución de la cantidad|Una disminución tanto del precio como de la cantidad|Un aumento tanto del precio como de la cantidad|La reducción del coste unitario incrementa la oferta.
En un mercado competitivo, disminuyen simultáneamente oferta y demanda. Ambas curvas conservan sus pendientes habituales. ¿Qué efecto puede afirmarse sin conocer la magnitud de los cambios?|La cantidad de equilibrio disminuye y el precio es indeterminado|El precio disminuye y la cantidad es indeterminada|El precio aumenta necesariamente|La cantidad aumenta necesariamente|Ambos desplazamientos reducen la cantidad, pero tienen efectos contrapuestos sobre el precio.
El precio de la mantequilla sube y la demanda de margarina aumenta, sin otros cambios. ¿Qué puede deducirse de ambos bienes?|Son sustitutivos y su elasticidad cruzada es positiva|Son complementarios y su elasticidad cruzada es negativa|La margarina es inferior necesariamente|La oferta de margarina debe haberse desplazado|El encarecimiento de un bien aumenta la demanda del otro, señal de sustitución.
Inicialmente Qd = 150 − P y Qs = 30 + P. Ambas curvas se desplazan y pasan a Qd = 180 − P y Qs = 60 + P. ¿Cuál es el nuevo equilibrio?|P = 60; Q = 120|P = 75; Q = 105|P = 45; Q = 105|P = 60; Q = 90|180 − P = 60 + P: P = 60 y Q = 120. Ambos desplazamientos elevan Q y dejan P igual en este supuesto concreto.
La elasticidad-renta de un bien es 1,2. Ante un aumento de renta del 5 %, ceteris paribus, ¿qué cambio aproximado se espera en su cantidad demandada?|Aumento del 6 %|Caída del 6 %|Aumento del 4,17 %|Subida de su precio del 6 %|1,2 × 5 % = 6 %. La elasticidad se refiere a la cantidad demandada, no al precio.
Al subir el precio de 25 a 30 €, las ventas bajan de 500 a 450 unidades. Con variaciones respecto a los valores iniciales, ¿cuál es la elasticidad-precio en valor absoluto?|0,5|2|1|0,1|El precio sube un 20 % y la cantidad cae un 10 %: 10/20 = 0,5.
El precio de B baja un 4 % y la cantidad demandada de A aumenta un 2 %, sin otros cambios. La elasticidad cruzada y la relación entre los bienes son:|−0,5; complementarios|0,5; sustitutivos|−2; complementarios|2; sustitutivos|2/(−4) = −0,5. El signo negativo identifica complementariedad.
¿Por qué la oferta de un producto industrial tiende a ser más elástica a largo plazo, manteniendo los demás factores constantes?|Porque las empresas pueden ajustar su capacidad productiva y pueden entrar nuevos oferentes|Porque el paso del tiempo obliga a mantener fija la producción|Porque la demanda se vuelve necesariamente vertical|Porque los costes marginales desaparecen|Un plazo mayor permite ajustar factores que están fijos a corto plazo y facilita la entrada.
Un vendedor pasa de cobrar 10 € por 1.000 unidades a cobrar 11 € por 900. ¿Qué sucede con su ingreso total?|Disminuye de 10.000 a 9.900 €|Aumenta de 10.000 a 11.000 €|Permanece constante por compensarse ambos porcentajes|Disminuye a 9.000 €|El aumento del 10 % del precio y la caída del 10 % de cantidad se multiplican: 1,1 × 0,9 = 0,99.
La elasticidad-precio de la oferta es 2. Si el precio aumenta un 3 % y se mantiene constante lo demás, la cantidad ofrecida aumenta aproximadamente:|Un 6 %|Un 1,5 %|Un 2 %|Un 5 %|La variación aproximada de cantidad es elasticidad × variación de precio: 2 × 3 % = 6 %.
El precio baja un 4 % y la cantidad demandada aumenta un 12 %, ceteris paribus. ¿Qué cambio exacto experimenta el ingreso total?|Aumenta un 7,52 %|Aumenta exactamente un 8 %|Disminuye un 7,52 %|Disminuye un 16 %|IT nuevo/IT inicial = 0,96 × 1,12 = 1,0752: aumento del 7,52 %.
En un mercado la cantidad ofrecida permanece fija en 500 unidades, mientras el precio sube de 8 a 10 € tras un aumento de demanda. ¿Cuál es la elasticidad-precio de la oferta en ese intervalo?|0; oferta perfectamente inelástica|1; oferta unitaria|Infinita; oferta perfectamente elástica|0,25; oferta inelástica|La cantidad no cambia aunque varía el precio; la elasticidad de oferta es cero.
La demanda de mercado es Qd = 100 − 2P. Con un precio de 20 €, se compran 60 unidades. ¿Cuál es el excedente del consumidor, suponiendo demanda lineal?|900 €|1.200 €|1.500 €|600 €|El precio de reserva máximo es 50 €. El área triangular es (50 − 20) × 60 / 2 = 900 €.
La oferta es Qs = 2P − 20. Con precio de equilibrio de 30 € se intercambian 40 unidades. Suponiendo oferta lineal, el excedente del productor es:|400 €|800 €|1.200 €|200 €|La oferta corta el eje de precios en 10 €. El área es (30 − 10) × 40 / 2 = 400 €.
Con Qd = 120 − 2P y Qs = 20 + 2P se fija un precio máximo de 20 €. Sin mercado negro, la escasez es:|20 unidades|60 unidades|80 unidades|0 unidades|A 20 €, Qd = 80 y Qs = 60; exceso de demanda = 20. El equilibrio sin intervención tiene P = 25 €.
Un mercado está en equilibrio a 40 € y se establece un precio mínimo de 35 €. Sin otros cambios, señale la respuesta correcta.|El mínimo no es vinculante y no altera el equilibrio|El precio debe disminuir a 35 €|Se genera necesariamente un excedente|La cantidad intercambiada debe disminuir|Un precio mínimo inferior al de equilibrio no impide que el mercado permanezca a 40 €.
''']

def economy(out):
 exam=out['module-53375']
 exam['models']=[dict(id=f'module-53375-{i+1}',title=f'Modelo {i+1} parcial',questions=shuffled(parse(text),'economy-new-'+str(i)),openQuestions=[]) for i,text in enumerate(ECONOMY)]
 exam['scope']='Tres modelos de parcial con 20 preguntas distintas por modelo, nuevos supuestos y cifras, siguiendo los conceptos y el estilo del parcial disponible. Pendiente del documento del final para preparar sus tres modelos.'
 assert all(len(m['questions'])==20 for m in exam['models'])

def number(v):
 return f'{v:,.2f}'.replace(',','@').replace('.',',').replace('@','.')

def numeric(prompt,right,wrong,explanation,unit='€',context=None):
 values=[right,*wrong];opts=[f'{number(v)} {unit}'.strip() for v in values]
 assert len(set(opts))==4,(prompt,opts)
 q=dict(prompt=prompt,options=opts,answer=0,explanation=explanation)
 if context:q['context']=context
 return q

def final_economy(m):
 q=[]
 def n(p,r,w,e,unit='€'):q.append(numeric(p,r,w,e,unit))
 def t(lines):q.extend(parse(lines[m]))
 # Scenarios change both figures and what is being contrasted across the models.
 t([
 'Un hogar paga a una empresa 240 € por reparar una ventana. La empresa realiza el trabajo este año en el país. ¿Cómo se registra en el PIB?|Como consumo de un servicio de producción corriente|Como inversión financiera del hogar|Se excluye por tratarse de una reparación|Solo se incluye si el hogar paga en efectivo|Es un servicio final producido en el período; entra en el consumo de los hogares.',
 'Un particular vende a otro un coche que se fabricó hace seis años por 7.500 €, sin intermediario. ¿Qué importe añade esta operación al PIB corriente?|Ninguno por la compraventa del coche usado|Los 7.500 € íntegros|Solo la diferencia con el precio original|Los 7.500 € como inversión|El coche no es producción del período; una comisión corriente sí sería un servicio, pero aquí no existe.',
 'Una inmobiliaria cobra 1.800 € de comisión por mediar este año en la venta de una vivienda usada. ¿Qué componente se incorpora al PIB corriente por esta operación?|El servicio de intermediación de 1.800 €|Todo el precio de la vivienda usada|Ninguno, porque la vivienda es antigua|La comisión como compra de un activo financiero|La vivienda usada no es producción corriente; la intermediación realizada este año sí lo es.'
 ])
 imports=[600,900,1200][m]
 t([
 f'Un hogar compra por {imports} € un teléfono importado y no hay margen de distribución nacional. En la identidad Y = C + I + G + X − M, esta compra:|Aumenta C y M en la misma cuantía, sin aumentar Y|Aumenta C y Y sin modificar M|Aumenta I y reduce C|Reduce M y aumenta Y|La importación se resta para que el gasto en producción extranjera no cuente como producción interior.',
 f'Una empresa compra una máquina nueva importada por {imports} € para su actividad. Sin servicios nacionales asociados, ¿cómo afecta a los componentes del PIB?|Aumenta I y M por igual; el efecto directo neto sobre Y es cero|Aumenta únicamente el consumo privado|Reduce I y aumenta las exportaciones|Aumenta Y en el precio íntegro de la máquina|La compra es inversión, pero el componente importado se deduce mediante M.',
 f'La Administración compra un equipo informático importado por {imports} €, sin servicios locales incluidos. ¿Qué registro evita atribuir su fabricación al país comprador?|Aumentar G y M por el mismo importe|Aumentar G sin registrar importaciones|Registrar una exportación por el importe pagado|Reducir C y aumentar I|El gasto público aumenta, pero la importación se resta en X − M.'
 ])
 quantity=100+20*m;price0=10+m;price1=12+2*m
 n(f'Una economía solo produce {quantity} unidades de un bien este año. Su precio actual es {price1} € y el precio del año base es {price0} €. ¿Cuál es el PIB real del año actual a precios del año base?',quantity*price0,[quantity*price1,quantity*(price1-price0),quantity*price0/price1],f'El PIB real valora las cantidades actuales a precios del año base: {quantity} × {price0} = {quantity*price0} €.')
 real=[200,250,400][m];nom=[230,300,420][m]
 n(f'El PIB nominal de una economía es {nom} millones y su PIB real, a precios del año base, es {real} millones. ¿Cuál es el deflactor del PIB (base 100)?',nom/real*100,[real/nom*100,(nom-real)/real*100,nom-real],f'Deflactor = PIB nominal / PIB real × 100 = {nom}/{real} × 100.','puntos')
 old=[120,125,150][m];new=[126,130,147][m]
 n(f'El IPC pasa de {old} a {new} entre dos años consecutivos. ¿Cuál es la tasa de inflación de ese período?',(new/old-1)*100,[new-old,(old/new-1)*100,new/old*100],f'Inflación = ({new} − {old})/{old} × 100; se usa como denominador el IPC anterior.','%')
 t([
 'El IPC aumenta un 3 % mientras el precio de los ordenadores disminuye. ¿Son compatibles ambos hechos?|Sí; sube el coste de la cesta representativa, aunque no todos sus precios suban|No; el IPC solo aumenta si todos los precios aumentan|No; un precio que baja implica deflación general|Sí; porque el IPC excluye todos los bienes cuyo precio disminuye|El IPC es un índice agregado; combina variaciones de distintos precios con sus ponderaciones.',
 'El coste de la cesta representativa permanece en 1.250 €, aunque suben los alimentos y bajan otros componentes. ¿Qué se deduce de su IPC entre ambos períodos?|La inflación medida por esa cesta es cero|Todos los precios individuales permanecen constantes|La inflación es necesariamente positiva|El PIB real no puede haber variado|Con la misma cesta y el mismo coste total no cambia el índice, aunque sí sus precios individuales.',
 'El IPC baja un 2 % en un año. Seleccione la afirmación que necesariamente se desprende del dato.|Disminuye el coste agregado de la cesta representativa|Bajan todos los salarios nominales un 2 %|Cada producto de la cesta baja un 2 %|La producción real cae un 2 %|El dato se refiere al nivel agregado de precios medido por el índice; no determina salarios ni producción.'
 ])
 t([
 'Un restaurante expresa el precio del menú como 18 euros. ¿Qué función del dinero se utiliza al expresar ese precio?|Unidad de cuenta|Depósito de valor exclusivamente|Factor de producción|Reserva obligatoria|La unidad de cuenta permite expresar y comparar valores monetarios.',
 'Una persona guarda 350 € para poder comprar dentro de un mes. ¿Qué función monetaria destaca esta decisión?|Depósito de valor|Unidad de cuenta exclusivamente|Arancel sobre el ahorro|Inversión en capital productivo necesariamente|Se conserva capacidad de compra para una fecha posterior, sujeta a la variación de precios.',
 'Una librería acepta euros a cambio de un libro en lugar de exigir otro bien. ¿Qué función desempeña el dinero en la operación?|Medio de intercambio|Factor tecnológico|Producto intermedio|Medida de la productividad|El dinero evita la doble coincidencia de necesidades propia del trueque.'
 ])
 reserve=[.10,.20,.25][m];deposit=[1000,2000,3000][m]
 n(f'En el modelo bancario simple, los bancos no mantienen reservas excedentarias y el público no retiene efectivo. Con coeficiente de reservas del {reserve*100:g} %, un aumento inicial de reservas de {deposit} € puede sostener como máximo ¿qué incremento total de depósitos?',deposit/reserve,[deposit*(1-reserve),deposit*reserve,deposit+deposit/reserve],f'Multiplicador simple = 1/r. El incremento máximo de depósitos es {deposit}/{reserve:g}; se incluye el depósito inicial.')
 t([
 'En el modelo monetario estudiado, el banco central compra deuda pública a los bancos. Sin cambios en otras condiciones, esta operación tiende a:|Aumentar las reservas bancarias y la oferta monetaria|Reducir las reservas y contraer la oferta monetaria|Reducir directamente el gasto público aprobado|Elevar el coeficiente de reservas por definición|La compra de activos inyecta reservas y constituye una operación de mercado abierto expansiva.',
 'El banco central vende deuda pública a los bancos y cobra con sus reservas. Manteniendo lo demás constante, ¿cuál es el efecto monetario esperado?|Disminuyen las reservas y tiende a reducirse la oferta monetaria|Aumentan las reservas y el crédito necesariamente|No hay operación de mercado abierto|Aumentan los depósitos por el importe de la venta automáticamente|La venta retira reservas del sistema; es una operación de mercado abierto contractiva.',
 'En el modelo simple sin exceso de reservas ni efectivo, se eleva el coeficiente obligatorio del 10 % al 20 %. Para una base de reservas dada:|Disminuye la capacidad máxima de creación de depósitos|El multiplicador aumenta de 10 a 20|Se duplica necesariamente el dinero en circulación|El multiplicador permanece en 10|1/r pasa de 10 a 5; una mayor fracción obligatoria reduce la expansión potencial.'
 ])
 exports=[80,120,150][m];im=[95,100,180][m]
 n(f'Una economía exporta bienes y servicios por {exports} millones e importa por {im} millones. En la identidad de economía abierta, ¿cuál es su salida neta de capital (SNC = X − M)?',exports-im,[im-exports,exports+im,exports],f'SNC = exportaciones netas = {exports} − {im} = {exports-im} millones. Un signo negativo indica entrada neta de capital.','millones')
 saving=[70,90,110][m];investment=[85,65,140][m]
 n(f'El ahorro nacional es de {saving} millones y la inversión interior de {investment} millones. Usando S = I + SNC, las exportaciones netas son:',saving-investment,[investment-saving,saving+investment,investment],f'Exportaciones netas = SNC = S − I = {saving} − {investment}.','millones')
 t([
 'En el modelo de fondos prestables de Mankiw, aumenta el déficit público por mayor gasto, sin variar el ahorro privado. ¿Cuál es el efecto inicial sobre ahorro nacional y tipo de interés real?|Cae el ahorro nacional y aumenta el tipo de interés real de equilibrio|Sube el ahorro nacional y cae el tipo de interés real|Ambos aumentan necesariamente|El déficit no afecta a la oferta de fondos prestables|Un déficit mayor reduce el ahorro público y desplaza la oferta de fondos a la izquierda.',
 'En el modelo de fondos prestables, un aumento de impuestos reduce el déficit público sin variar el gasto ni el ahorro privado. ¿Qué combinación se espera?|Aumenta el ahorro nacional y disminuye el tipo de interés real|Disminuye el ahorro nacional y aumenta el tipo de interés real|Disminuyen ahorro e inversión por identidad|No cambia la oferta de fondos prestables|La reducción del déficit eleva el ahorro público; la oferta de fondos aumenta.',
 'En una economía abierta aumenta el deseo de ahorro privado, sin cambios en el saldo público. Según el modelo de fondos prestables:|La oferta de fondos se desplaza a la derecha y baja el tipo de interés real|La demanda de fondos se desplaza a la izquierda por definición|El tipo de interés real debe aumentar|El ahorro nacional disminuye|El mayor ahorro amplía la oferta de financiación; el equilibrio exige un tipo real menor.'
 ])
 t([
 'El tipo de interés real nacional sube respecto al extranjero, sin cambios de riesgo. En el modelo de economía abierta, la salida neta de capital tiende a:|Disminuir, favoreciendo una apreciación de la moneda nacional|Aumentar, favoreciendo la apreciación|Disminuir, aumentando la oferta de moneda nacional en divisas|Aumentar porque los activos nacionales se hacen menos atractivos|Los activos nacionales resultan relativamente más atractivos; cae SNC y con ella la oferta de moneda nacional en divisas.',
 'Aumenta el riesgo percibido de mantener activos nacionales y se produce una fuga de capitales. En el mercado de divisas del modelo, ceteris paribus:|Aumenta la oferta de moneda nacional y esta se deprecia|Aumenta la demanda de moneda nacional y esta se aprecia|Disminuye la salida neta de capital|La oferta de moneda nacional se desplaza a la izquierda|La mayor salida neta de capital amplía la oferta de moneda nacional para comprar activos extranjeros.',
 'El tipo de interés real nacional disminuye respecto al extranjero, con riesgos constantes. En el modelo de Mankiw, lo esperable es:|Mayor salida neta de capital y depreciación de la moneda nacional|Menor salida neta de capital y apreciación|Mayor demanda de activos nacionales por su rentabilidad relativa|Ninguna relación entre rentabilidad y flujos de capital|La menor rentabilidad relativa nacional favorece la compra neta de activos extranjeros y aumenta la oferta de moneda nacional en divisas.'
 ])
 t([
 'El nivel general de precios baja y los hogares mantienen el mismo saldo monetario nominal. Según el efecto riqueza sobre la demanda agregada:|Aumenta el valor real del dinero y se favorece el consumo|Disminuye el valor real del dinero y se reduce el consumo|Se desplaza necesariamente la oferta agregada a largo plazo|Se reduce el saldo monetario nominal por definición|Con el mismo dinero nominal y precios menores aumenta su capacidad de compra.',
 'El nivel general de precios sube con saldos monetarios nominales constantes. ¿Qué mecanismo describe el efecto riqueza?|Cae el valor real del dinero y tiende a disminuir el consumo|Aumenta el poder de compra del saldo monetario|Aumenta necesariamente el capital físico|Se desplaza la demanda agregada por un aumento autónomo del gasto público|El efecto riqueza explica un movimiento sobre la DA: mayores precios reducen los saldos monetarios reales.',
 'Un descenso del nivel de precios eleva el consumo al incrementar el poder de compra de la riqueza monetaria. En el modelo DA-OA se representa como:|Un movimiento a lo largo de la curva de demanda agregada|Un desplazamiento de DA por una rebaja de impuestos|Un desplazamiento de OA a largo plazo por más capital|Una contracción autónoma de la oferta monetaria|El nivel de precios es la variable del eje: su efecto riqueza genera movimiento sobre DA, no desplazamiento autónomo.'
 ])
 t([
 'Una mejora permanente de la tecnología eleva la producción potencial. Manteniendo lo demás constante, la oferta agregada a largo plazo:|Se desplaza a la derecha|Se desplaza a la izquierda|Se vuelve decreciente|No cambia porque solo depende de precios esperados|La producción potencial depende de recursos y productividad; la tecnología puede elevarla.',
 'Un aumento del nivel de precios esperado, sin cambios en trabajo, capital ni tecnología, afecta a la oferta agregada a largo plazo de qué manera?|No desplaza la curva|La desplaza a la derecha por sí solo|La desplaza a la izquierda por sí solo|La convierte en horizontal|En el modelo clásico, la producción potencial es independiente del nivel de precios esperado.',
 'Una catástrofe destruye parte del capital productivo de una economía. Sin otras variaciones, la oferta agregada a largo plazo:|Se desplaza a la izquierda al caer la producción potencial|Se desplaza a la derecha por subir la escasez|Permanece fija porque el capital no afecta al PIB real|Se hace horizontal al nivel de precios previo|Una reducción persistente del capital reduce la capacidad de producción.'
 ])
 t([
 'Desde un equilibrio inicial a largo plazo, el Estado aumenta sus compras. Con OA a corto plazo creciente y sin otros cambios, ¿qué ocurre inicialmente?|Aumentan el nivel de precios y la producción real|Baja el nivel de precios y aumenta la producción|Suben los precios y disminuye la producción|Bajan ambos|El aumento de compras desplaza DA a la derecha; a corto plazo suben P e Y.',
 'Desde el equilibrio, una caída de confianza reduce el gasto de inversión. Con OA a corto plazo creciente, manteniéndose lo demás constante:|Disminuyen precios y producción real a corto plazo|Suben precios y producción real|Bajan precios y sube la producción|Suben precios y baja la producción|La inversión menor desplaza DA a la izquierda: bajan P e Y.',
 'Un encarecimiento súbito del petróleo desplaza la OA a corto plazo a la izquierda. Con DA constante, ¿qué combinación resulta inicialmente?|Aumentan los precios y disminuye el PIB real|Disminuyen precios y PIB real|Aumentan precios y PIB real|Disminuyen los precios y aumenta el PIB real|Es un shock adverso de oferta: menor producción y mayor nivel de precios.'
 ])
 t([
 'Una expansión monetaria reduce el tipo de interés a corto plazo en el modelo estudiado. ¿Qué cadena es coherente con ello?|Aumenta la inversión y DA se desplaza a la derecha|Disminuye la inversión y DA se desplaza a la derecha|Aumenta la inversión y DA se desplaza a la izquierda|La oferta agregada a largo plazo cambia por definición|El menor tipo de interés abarata la financiación de la inversión; el aumento del gasto desplaza DA a la derecha.',
 'Una contracción monetaria eleva el tipo de interés a corto plazo. Sin otros cambios, el mecanismo de transmisión del modelo predice:|Menor inversión y desplazamiento de DA a la izquierda|Mayor inversión y desplazamiento de DA a la derecha|Menor inversión y desplazamiento de OA a largo plazo a la derecha|Mayor inversión por el encarecimiento del crédito|El aumento del tipo de interés desincentiva gasto de inversión y reduce DA.',
 'El banco central compra activos y el tipo de interés cae. Si la inversión responde negativamente al tipo de interés, ¿cuál es el efecto esperado sobre DA?|Se desplaza a la derecha por mayor inversión|Se desplaza a la izquierda por mayor inversión|Solo hay un movimiento sobre DA causado por el tipo de interés|Se desplaza a la derecha porque el gasto público debe aumentar|La compra monetaria favorece inversión y gasto agregado; no requiere un aumento de compras públicas.'
 ])
 pmc=[.5,.75,.8][m];spend=[30,40,25][m]
 n(f'En el modelo keynesiano simple cerrado, sin impuestos, importaciones ni efecto expulsión, PMC = {pmc:g}. Si el gasto público aumenta {spend} millones, ¿cuánto aumenta la renta de equilibrio?',spend/(1-pmc),[spend*pmc,spend,spend/(1+pmc)],f'Multiplicador = 1/(1 − PMC); aumento de renta = {spend}/(1 − {pmc:g}).','millones')
 t([
 'Durante una recesión aumentan las prestaciones por desempleo sin aprobarse una ley nueva. Este mecanismo es:|Un estabilizador automático que sostiene la renta disponible|Una política monetaria contractiva|Un aumento discrecional del coeficiente de reservas|Una reducción automática de la demanda agregada|Las reglas preexistentes elevan transferencias cuando cae la actividad, amortiguando la contracción.',
 'El Gobierno aumenta sus compras, sube el tipo de interés y parte de la inversión privada se reduce. ¿Cómo se denomina este último efecto?|Efecto expulsión o crowding-out|Efecto riqueza de una caída de precios|Multiplicador monetario de reservas|Depreciación automática de la moneda|La financiación del mayor gasto presiona el tipo de interés y puede desplazar inversión privada.',
 'Ante una contracción de demanda agregada, el Gobierno reduce impuestos para sostener el gasto privado. Con OA a corto plazo creciente, esta política tiende a:|Desplazar DA a la derecha y amortiguar la caída de producción|Desplazar DA a la izquierda por aumentar la renta disponible|Reducir necesariamente la oferta agregada potencial|Eliminar todos los retardos de la política económica|La política fiscal expansiva pretende compensar parte de la caída de demanda; no garantiza ausencia de retardos.'
 ])
 t([
 'En una economía con OA a corto plazo creciente, coinciden expansión monetaria y aumento de compras públicas. Sin otros shocks, el efecto de corto plazo es:|Suben el nivel de precios y el PIB real|Bajan ambos|Suben los precios y baja el PIB real|Bajan los precios y sube el PIB real|Ambas políticas desplazan DA a la derecha.',
 'Con OA a corto plazo creciente, coinciden una contracción monetaria y una reducción de compras públicas. Sin otros cambios:|Bajan el nivel de precios y el PIB real|Suben ambos|Suben los precios y baja el PIB real|Bajan los precios y sube el PIB real|Las dos políticas reducen DA; sus efectos de corto plazo sobre precios y producción tienen el mismo sentido.',
 'La inversión privada cae, pero el Gobierno aumenta sus compras. Con OA a corto plazo creciente, sin conocer la magnitud de ambos cambios:|El efecto neto sobre DA, precios y producción es indeterminado|DA aumenta necesariamente|DA disminuye necesariamente|La oferta agregada a largo plazo aumenta necesariamente|Los dos componentes de gasto cambian en sentidos opuestos; hace falta conocer su efecto neto.'
 ])
 assert len(q)==20,len(q)
 return q

# Extend the partial replacement once the final source is available.
partial_economy=economy
def economy(out):
 partial_economy(out);exam=out['module-53375']
 for m in range(3):
  exam['models'].append(dict(id=f'module-53375-final-{m+1}',title=f'Modelo {m+1} final',questions=shuffled(final_economy(m),f'econ-final-{m}'),openQuestions=[]))
 exam['sources'].append('Ex F Economía _final 25-26.pdf · pp. 1–4')
 exam['scope']='Parcial: tres modelos de microeconomía (20 preguntas; referencia: 40 minutos). Final: tres modelos de macroeconomía (20 preguntas; referencia: 50 minutos). Nuevos supuestos y datos basados en los dos exámenes aportados. Acierto +0,50; error −0,17; blanco 0, según los documentos anteriores, no como confirmación de la convocatoria actual.'

def partial_account(m):
 name=['Linar Muebles','Roble Comercial','Nácar Hogar'][m];q=[]
 mach=100000+12000*m;it=20000+3000*m;acc=18000+2500*m
 clients=24000+3000*m;fi=4000+1000*m
 a=100+10*m;b=150+10*m;c=100+10*m;p0=50+2*m;p1=60+3*m;p2=70+4*m;sold=250+20*m
 ei=a*p0;buys=b*p1+c*p2;left=a+b+c-sold;ef=left*p2;cogs=ei+buys-ef
 capital=60000+5000*m;reserves=20000+2000*m;prior=15000+1500*m;st=35000+2500*m;lt=45000+3500*m;tax0=5000+500*m;sup=18000+2000*m
 bank0=capital+reserves+prior+st+lt+tax0+sup-(mach+it-acc+clients+fi+ei)
 new=20000+4000*m;resold=20000+2000*m;resnew=4000+500*m;salary=12000+1400*m;other=4000+450*m;interest=1500+200*m;reclass=5000+1000*m
 price=200+15*m;sales=sold*price;cashsales=sales*.90
 amort=(mach-resold)*.10+it*.20+(new-resnew)*.10*.5
 ebitda=sales-cogs-salary-other;pbt=ebitda-amort-interest;tax=pbt*.25;profit=pbt-tax
 pc=buys+reclass+tax;pn=capital+reserves+prior+profit
 bank1=bank0+clients-sup-tax0-st+cashsales-new-salary-other-interest
 anc=mach+it+new-acc-amort;assets=anc+bank1+(sales-cashsales)+fi+ef
 assert abs(assets-(pn+pc+lt-reclass))<1e-8
 assert bank0>0 and bank1>0 and pbt>0 and left<=c
 context=f'''Caso {name} · ejercicio X1. Todos los importes son euros.
Balance de apertura: maquinaria {mach}; equipos informáticos {it}; amortización acumulada {acc}; clientes {clients}; inversiones financieras a corto plazo {fi}; mercaderías {a} unidades a {p0} €/unidad; bancos por determinar. Capital {capital}; reservas {reserves}; beneficio de X0 {prior}; deudas bancarias a corto plazo {st}; a largo plazo {lt}; Hacienda acreedora {tax0}; proveedores {sup}. No hay otras partidas.
Durante X1: se cobran todos los clientes iniciales y se pagan proveedores, Hacienda y deuda bancaria a corto plazo iniciales. De la deuda a largo plazo, {reclass} pasa a corto plazo, sin pagarse todavía. El beneficio de X0 se traspasa íntegramente a reservas.
Se compran a crédito {b} unidades a {p1} € y después {c} a {p2} €. Se venden {sold} unidades a {price} €/unidad, todas después de ambas compras; se cobra el 90 % de las ventas y queda pendiente el resto. No se paga ninguna compra nueva durante X1. Inventario periódico y valoración FIFO.
Personal {salary}, otros gastos de explotación {other} e intereses {interest}, pagados por banco. El 1 de julio se compra y pone en funcionamiento maquinaria nueva por {new}, pagada por banco. Las inversiones financieras iniciales se mantienen y no generan ingresos en el caso base.
Amortización lineal: maquinaria antigua, 10 % anual sobre coste menos residual de {resold}; nueva, 10 % sobre coste menos residual de {resnew}, prorrateada 6/12; equipos informáticos, 20 % anual sin residual. Ningún activo agota su vida útil.
Impuesto hipotético: 25 % del beneficio antes de impuestos, íntegramente deducible en el caso base. El impuesto de X1 queda pendiente de pago. Sin IVA, dividendos ni operaciones, normas o impuestos adicionales. Redondee solo el resultado final a dos decimales. Las hipótesis alternativas afectan únicamente a su pregunta.'''
 def add(p,r,w,e):q.append(numeric(f'Caso {name}. '+p,r,w,e,context=context))
 add('¿Qué valor tiene el activo no corriente neto en el balance de apertura?',mach+it-acc,[mach+it,mach-acc,mach+it+acc],f'Inmovilizado neto inicial = {mach} + {it} − {acc} = {mach+it-acc} €. No incluye inversiones financieras a corto plazo.')
 add('¿Qué saldo deudor de bancos permite cuadrar el balance de apertura?',bank0,[bank0+acc,bank0+ei,bank0+prior],f'Bancos = patrimonio neto y pasivo iniciales menos restantes activos netos = {bank0} €. La amortización acumulada resta al activo.')
 add('¿Cuál es el pasivo corriente al cierre de X1?',pc,[pc+st,pc-tax,pc-reclass],f'Proveedores nuevos {buys} + deuda reclasificada {reclass} + impuesto pendiente {number(tax)} = {number(pc)} €. La deuda inicial de corto plazo ya está pagada.')
 add('¿Cuál es el activo total al cierre de X1?',assets,[assets+amort,assets+st,assets-fi],f'ANC {number(anc)} + bancos {number(bank1)} + clientes {number(sales-cashsales)} + inversiones {fi} + existencias {ef} = {number(assets)} €. Se verifica A = PN + P.')
 add('¿Cuál es el EBITDA de X1?',ebitda,[ebitda-amort,pbt,sales-buys-salary-other],f'Ventas {sales} − consumo FIFO {cogs} − personal {salary} − otros gastos {other} = {ebitda} €. No se restan amortización ni intereses.')
 add('¿Cuál es el consumo de mercaderías de X1 aplicando FIFO?',cogs,[buys,ei+buys,ef],f'Quedan {left} unidades del último lote, valoradas en {ef} €. Consumo = {ei} + {buys} − {ef} = {cogs} €.')
 add('¿Cuál es el patrimonio neto al cierre de X1?',pn,[pn-prior,pn-profit,pn+tax],f'PN = capital {capital} + reservas iniciales {reserves} + beneficio X0 retenido {prior} + resultado X1 {number(profit)} = {number(pn)} €. Traspasar el beneficio anterior a reservas no altera PN.')
 # Alternative inventory assumption is isolated and does not change the other questions.
 lifo=c*p2+(sold-c)*p1
 add('Si solo para esta pregunta se aplicara LIFO, ¿cuál sería el consumo de mercaderías? Todas las ventas se producen después de las compras.',lifo,[cogs,ef,ei+buys],f'Salen primero {c} unidades del último lote a {p2} y luego {sold-c} del anterior a {p1}: {lifo} €. Es una hipótesis docente, sin extenderla a las otras preguntas.')
 rate=[.04,.05,.06][m];extra=fi*rate*.75
 add(f'Si las inversiones financieras generaran un {rate*100:g} % anual, cobrado al cierre, ¿cuál sería el patrimonio neto final? Mantenga el impuesto del 25 %.',pn+extra,[pn+fi*rate,pn-extra,pn],f'Ingreso financiero adicional = {fi} × {rate:g}. Su efecto neto tras impuesto es {number(extra)} €, que se suma a PN base {number(pn)} €. No se vuelve a sumar el principal invertido.')
 nondeduct=300+120*m
 add(f'Suponga que {nondeduct} € de los gastos ya incluidos en la cuenta de resultados no fueran fiscalmente deducibles. ¿Qué beneficio después de impuestos resultaría, sin volver a registrar ese gasto?',profit-nondeduct*.25,[profit-nondeduct,profit+nondeduct*.25,profit],f'El beneficio contable antes de impuestos no cambia. Base fiscal = {number(pbt)} + {nondeduct}; impuesto adicional = {number(nondeduct*.25)} €. Resultado neto = {number(profit)} − {number(nondeduct*.25)} €.')
 return q

def final_account(m):
 q=[];company=['TecnoRío','Atlas Equipos','Brisa Industrial'][m]
 investment=[240000,300000,360000][m];market=[200,250,300][m];quotas=[[.04,.08,.12],[.04,.08,.12],[.04,.08,.12]][m]
 prices=[50000+5000*m,52000+5500*m,54000+6000*m];costs=[32000+3000*m,33000+3200*m,34000+3400*m];fixed=120000+15000*m;rate=[.06,.08,.10][m];credit=[.08,.10,.12][m]
 units=[market*x for x in quotas];sales=[u*p for u,p in zip(units,prices)];dep=investment/3
 ebitda=[u*(p-c)-fixed for u,p,c in zip(units,prices,costs)];profit=[e-dep for e in ebitda];nof=[x*credit for x in sales];delta=[nof[0],nof[1]-nof[0],nof[2]-nof[1]];fc=[e-d for e,d in zip(ebitda,delta)];van=-investment+sum(v/(1+rate)**(i+1) for i,v in enumerate(fc))
 assert sum(fc)>investment and fc[0]+fc[1]<investment
 payback=2+(investment-fc[0]-fc[1])/fc[2];pm=(fixed+dep)/(prices[0]-costs[0])
 context=f'''Caso {company} · proyecto de internacionalización de maquinaria. Importes en euros.
Inversión inicial en año 0: {investment}, amortizada linealmente en 3 años, sin valor residual. Tipo de descuento anual: {rate*100:g} %.
Año 1: mercado {market} máquinas; cuota {quotas[0]*100:g} %; precio unitario {prices[0]}; coste variable unitario {costs[0]}.
Año 2: mercado {market}; cuota {quotas[1]*100:g} %; precio {prices[1]}; coste variable {costs[1]}.
Año 3: mercado {market}; cuota {quotas[2]*100:g} %; precio {prices[2]}; coste variable {costs[2]}.
Costes fijos anuales, sin amortización: {fixed}. Los costes variables y fijos se pagan en el año. No hay existencias ni proveedores pendientes. Clientes al cierre: {credit*100:g} % de las ventas de ese año. NOF iniciales: cero. NOF = clientes + existencias − proveedores. No hay impuestos, intereses, otras inversiones ni partidas adicionales.
FCL anual = resultado + amortización − variación de NOF. Para el VAN de los tres años no se recuperan NOF ni se incluye valor terminal; el proyecto continúa. El payback simple admite interpolación uniforme dentro del año. Punto muerto contable: incluye amortización. Redondee el resultado final a dos decimales. Cada hipótesis adicional afecta solo a su pregunta.'''
 def add(p,r,w,e,ctx=context,unit='€'):q.append(numeric(p,r,w,e,unit,ctx))
 add(f'Caso {company}. ¿Cuál es el resultado de la cuenta de pérdidas y ganancias en el año 3?',profit[2],[ebitda[2],profit[1],profit[2]-nof[2]],f'Ventas {number(sales[2])} − costes variables {number(units[2]*costs[2])} − fijos {fixed} − amortización {number(dep)} = {number(profit[2])} €. Las NOF afectan a caja, no al resultado.')
 add(f'Caso {company}. ¿Cuál es el flujo libre de caja del año 2?',fc[1],[profit[1],ebitda[1],ebitda[1]-nof[1]],f'FCL2 = resultado2 + amortización − (NOF2 − NOF1) = {number(profit[1])} + {number(dep)} − {number(delta[1])} = {number(fc[1])} €. No se resta todo el saldo de NOF.')
 add(f'Caso {company}. ¿Cuál es el VAN de los flujos de los años 0 a 3, sin recuperación de NOF ni valor terminal?',van,[sum(fc)-investment,van+investment,van+nof[2]/(1+rate)**3],f'VAN = −{investment} + {number(fc[0])}/(1+{rate:g}) + {number(fc[1])}/(1+{rate:g})² + {number(fc[2])}/(1+{rate:g})³ = {number(van)} €. No se añade una recuperación de NOF no prevista.')
 add(f'Caso {company}. ¿Cuál es el payback simple, interpolando uniformemente dentro del año de recuperación?',payback,[investment/(sum(fc)/3),investment/fc[2],3.0],f'Al final del año 2 faltan {number(investment-fc[0]-fc[1])} €. Payback = 2 + saldo pendiente/FCL3 = {number(payback)} años.',unit='años')
 add(f'Caso {company}. ¿Cuál es el punto muerto contable del año 1 en unidades teóricas, sin redondear al entero superior?',pm,[fixed/(prices[0]-costs[0]),fixed/prices[0],(fixed+dep)/prices[0]],f'Umbral contable = (fijos + amortización)/(precio − coste variable) = ({fixed} + {number(dep)})/({prices[0]} − {costs[0]}). Para ventas enteras sin pérdidas se redondearía al entero superior.',unit='unidades')
 variants=[
 f'Caso {company}. Si se conceden 45 días de aplazamiento de pago de los costes variables, sin cambiar precios ni costes, ¿cómo varía el punto muerto contable del año 1?|No varía, aunque disminuyen las NOF|Disminuye al reducirse las NOF|Aumenta porque se aplaza un pago|No puede calcularse sin conocer los intereses del préstamo|El plazo de pago cambia financiación operativa, no margen unitario ni costes fijos; aquí no se introducen intereses.',
 f'Caso {company}. Si la proporción de ventas pendiente de cobro baja del {credit*100:g} % al 5 %, sin variar precios ni costes, el punto muerto contable del año 1:|No varía; cambia la inversión en clientes, no el resultado unitario|Disminuye por el menor saldo de clientes|Aumenta por cobrar antes|Se convierte en cero porque mejora la caja|Los plazos de cobro afectan a las NOF y al FCL, pero no al umbral contable si costes e ingresos no cambian.',
 f'Caso {company}. Si se exige cobrar por adelantado el 20 % de cada venta, sin variar volumen, precios ni costes y sin intereses, ¿cómo cambia el punto muerto contable?|Permanece igual aunque mejore la financiación operativa|Se reduce un 20 %|Aumenta un 20 %|Pasa a coincidir necesariamente con el umbral de caja|La estructura de costes e ingresos devengados no cambia por adelantar el cobro.'
 ]
 q.extend(parse(variants[m]));q[-1]['context']=context
 # Expansion exercise: old investment is fully depreciated; explicit new profitability target.
 extra=8+2*m;newinv=400000+100000*m;newdep=newinv/4;target=[.60,.65,.70][m];cvextra=costs[2]+2000+500*m
 targetprofit=newinv*target
 required=(targetprofit+fixed+newdep-units[2]*(prices[2]-costs[2])+extra*cvextra)/extra
 assert required>0
 add(f'Caso {company}. En el año 4 se mantienen las {units[2]:g} máquinas del año 3 al mismo precio y coste variable unitario. Se venden además {extra} máquinas, con coste variable unitario de {cvextra} €. Para la ampliación se invierten {newinv} €, amortizados linealmente en cuatro años sin residual; la inversión anterior está totalmente amortizada. Los otros costes fijos anuales siguen en {fixed} €. Sin impuestos ni otras partidas, ¿qué precio unitario deben tener las {extra} máquinas adicionales para lograr resultado del año 4 / nueva inversión = {target*100:g} %?',required,[required-newdep/extra,required+newdep/extra,required-targetprofit/extra],f'Resultado objetivo = {number(targetprofit)} €. Se resuelve: {units[2]:g} × ({prices[2]} − {costs[2]}) + {extra} × (P − {cvextra}) − {fixed} − {number(newdep)} = {number(targetprofit)}. P = {number(required)} €.')
 # Five balance/ratio questions with full, internally consistent two-year data.
 firm=['Bodega Albor','Viñedos Loma','Bodega Horizonte'][m];scale=m+1
 ac0=90000*scale;ac1=(110000+2000*m)*scale;pc0=60000*scale;pc1=(72000+1000*m)*scale
 assets0=150000*scale;assets1=180000*scale;pn0=60000*scale;pn1=72000*scale
 sales0=80000*scale;sales1=(96000+2000*m)*scale;net0=8000*scale;net1=(9000+500*m)*scale
 debt0=30000*scale;debt1=48000*scale;eb0=18000*scale;eb1=22000*scale
 stock=60000*scale;cust=40000*scale;prov=23000*scale;cash=(ac1-stock-cust)
 res0=30000*scale;res1=35000*scale
 balance=f'''Caso {firm} · datos docentes en euros. X9 es el año más reciente.
X8: activo corriente {ac0}; pasivo corriente {pc0}; activo total {assets0}; patrimonio neto {pn0}; ventas {sales0}; resultado neto {net0}; deuda financiera bruta {debt0}; EBITDA {eb0}; reservas {res0}.
X9: activo corriente {ac1}; pasivo corriente {pc1}; activo total {assets1}; patrimonio neto {pn1}; ventas {sales1}; resultado neto {net1}; deuda financiera bruta {debt1}; EBITDA {eb1}; reservas {res1}.
En X9 las existencias son {stock}, clientes {cust}, proveedores {prov} y el resto del activo corriente es efectivo ({cash}). Pasivo no corriente = activo total − PN − PC en cada año. Las restantes partidas de pasivo no financiero no generan intereses. NOF = existencias + clientes − proveedores. No ha habido movimientos en reservas distintos de la aplicación parcial del resultado X8. La parte no retenida de ese resultado se reparte como dividendo. Use los saldos de cierre para los ratios; sin otros ajustes.'''
 fm0=ac0-pc0;fm1=ac1-pc1
 add(f'Caso {firm}. ¿Cuánto varía el fondo de maniobra entre X8 y X9?',fm1-fm0,[ac1-ac0,pc1-pc0,fm1],f'FM X8 = {fm0}; FM X9 = {fm1}. Diferencia = {fm1-fm0} €.',ctx=balance)
 q.extend(parse(f'Caso {firm}. La deuda financiera bruta / EBITDA pasa de {number(debt0/eb0)} a {number(debt1/eb1)} veces. Atendiendo solo a este indicador, ¿qué interpretación procede?|Aumenta la carga de deuda relativa a la capacidad operativa de generar resultado|Disminuye el riesgo porque el EBITDA aumenta en euros|La menor ratio indica necesariamente más riesgo|Esta ratio mide exclusivamente la rentabilidad del accionista|La deuda crece proporcionalmente más que el EBITDA; el indicador empeora. Es una señal parcial y no una valoración completa del riesgo.'));q[-1]['context']=balance
 add(f'Caso {firm}. ¿Qué porcentaje de las ventas de X9 representan las necesidades operativas de fondos?',(stock+cust-prov)/sales1*100,[(stock+cust)/sales1*100,(stock+cust-prov)/assets1*100,(stock+cust-prov-cash)/sales1*100],f'NOF = {stock} + {cust} − {prov} = {stock+cust-prov}. NOF/ventas × 100 = {number((stock+cust-prov)/sales1*100)} %. El efectivo se excluye de la definición dada.',ctx=balance,unit='%')
 add(f'Caso {firm}. Con datos de cierre de X9, ¿cuál es el ROE = resultado neto / patrimonio neto?',net1/pn1*100,[net1/assets1*100,net1/sales1*100,assets1/pn1],f'ROE = {net1}/{pn1} × 100 = {number(net1/pn1*100)} %. También es margen × rotación × capitalización.',ctx=balance,unit='%')
 add(f'Caso {firm}. ¿Qué porcentaje del beneficio de X8 se destina a reservas, según los movimientos descritos?',(res1-res0)/net0*100,[(res1-res0)/net1*100,(net0-(res1-res0))/net0*100,100],f'Aumento de reservas = {res1-res0}. Al no haber otros movimientos, porcentaje retenido = {res1-res0}/{net0} × 100.',ctx=balance,unit='%')
 # Eight stand-alone problems follow the source final, with new data and explicit conventions.
 stand=[
 'En inventario periódico, una distribuidora compra a crédito mercaderías por 4.800 €. ¿Qué registro y ajuste corresponden en este supuesto?|La compra se registra como gasto y las existencias se ajustan al cierre mediante variación de existencias|Se registra la compra solo como aumento de existencias y nunca se ajusta al cierre|Se reconoce gasto únicamente cuando se paga al proveedor|Se reconoce ingreso por el importe de la compra|En el sistema periódico utilizado en el examen, compras se registran como gasto y al cierre se regularizan existencias.',
 'Una distribuidora usa inventario periódico. Sus existencias iniciales son 2.500 €, las compras 9.000 € y las finales 3.200 €. ¿Qué afirmación sobre la regularización es correcta?|El consumo es menor que las compras en 700 €|El consumo supera las compras en 700 €|El consumo coincide con compras porque se usa inventario periódico|Las existencias finales son ingresos por ventas|Consumo = 2.500 + 9.000 − 3.200 = 8.300 €. El aumento de existencias reduce el consumo respecto a compras.',
 'En el cierre de una empresa con inventario periódico, se omite contabilizar un aumento de existencias de 1.600 €. ¿Qué efecto tiene la omisión, antes de impuestos?|Infravalora el resultado y el activo corriente en 1.600 €|Sobrevalora el resultado y el activo en 1.600 €|No afecta al resultado porque solo cambia el almacén|Aumenta únicamente la tesorería|Omitir el aumento deja demasiado consumo reconocido y existencias finales demasiado bajas.'
 ]
 q.extend(parse(stand[m]))
 daily=1000+200*m;margin=[.40,.50,.25][m];days=30+15*m
 clientbal=daily*(1+margin)*days;providerbal=daily*days
 add(f'Una distribuidora sin existencias compra por {daily} € diarios y vende con un margen del {margin*100:g} % sobre coste. En régimen uniforme de 360 días, cobra y paga a {days} días. ¿Qué NOF = clientes − proveedores necesita?',clientbal-providerbal,[0,providerbal-clientbal,clientbal],f'Clientes = {daily} × (1 + {margin:g}) × {days} = {number(clientbal)}; proveedores = {daily} × {days} = {providerbal}. Igual plazo no implica igual saldo porque ventas y compras difieren.',ctx=None)
 q.extend(parse([
 'Una empresa registra 6.000 € de amortización anual de una máquina ya pagada. ¿Cómo se clasifica esa dotación?|Gasto de explotación sin salida de caja del año por la dotación|Gasto financiero pagado necesariamente al cierre|Pago de la deuda al proveedor de la máquina|Una cuenta de ingreso que aumenta el EBITDA|La dotación distribuye el coste del activo y reduce EBIT; no supone por sí misma un pago del ejercicio.',
 'Se adquiere al contado un equipo de 18.000 €, amortizado linealmente en seis años sin residual. Sin otros costes, ¿qué efecto tiene la dotación anual sobre EBITDA y EBIT?|No reduce EBITDA y reduce EBIT en 3.000 €|Reduce ambos en 3.000 €|Reduce EBITDA pero no EBIT|Reduce EBIT en 18.000 € cada año|La dotación anual es 18.000/6 = 3.000 €. EBITDA se calcula antes de amortizaciones; EBIT después.',
 'Una máquina se compró a crédito en el ejercicio anterior. Este año se pagan 8.000 € al proveedor y se dota amortización por 2.000 €. ¿Cuál es la interpretación correcta?|El pago reduce caja y deuda; la amortización es gasto de 2.000 € sin pago por la dotación|Ambas operaciones son gastos de explotación por 10.000 €|Solo el pago reduce el resultado del año|La amortización aumenta el saldo del proveedor en 2.000 €|Pago de principal y reconocimiento del gasto por depreciación son operaciones distintas.'
 ][m]))
 assets=12000000+3000000*m;liabilities=8000000+1000000*m;roa=[.05,.06,.08][m];net=assets*roa
 add(f'Una empresa tiene activo de {assets} €, pasivo comercial sin intereses de {liabilities} € y ROA definido como (beneficio neto + gastos financieros)/activo del {roa*100:g} %. No tiene gastos financieros. ¿Cuál es su ROE con saldos de cierre?',net/(assets-liabilities)*100,[roa*100,net/assets*100+1,net/liabilities*100],f'PN = {assets} − {liabilities} = {assets-liabilities}; beneficio = {assets} × {roa:g} = {number(net)}. ROE = beneficio/PN × 100.',ctx=None,unit='%')
 cost=28000+6000*m;res=3000+1000*m;life=5;years=[2,3,1][m];book=cost-(cost-res)/life*years
 add(f'Una máquina cuesta {cost} €, tiene valor residual {res} € y vida útil de cinco años. Se amortiza linealmente desde el 1 de enero de X1. ¿Cuál es su valor neto contable al cierre de X{years}?',book,[cost-res,cost-cost/life*years,(cost-res)/life*years],f'Amortización anual = ({cost} − {res})/5. Valor neto tras {years} años completos = {number(book)} €.',ctx=None)
 lots=[(3,1100+100*m),(5,1300+120*m),(2,1600+140*m)];remain=4+m;cmp=sum(u*p for u,p in lots)/10;ending=cmp*remain
 add(f'Se compran, por este orden, 3 unidades a {lots[0][1]} €, 5 a {lots[1][1]} € y 2 a {lots[2][1]} €. No hay existencias iniciales. Al cierre quedan {remain} unidades. Aplicando CMP periódico, sin truncar el coste unitario, ¿cuál es el valor final del almacén?',ending,[remain*lots[2][1],remain*lots[0][1],sum(u*p for u,p in lots)],f'Coste medio = coste total/10 = {number(cmp)} €/unidad. Existencias finales = {remain} × {number(cmp)} = {number(ending)} €.',ctx=None)
 equity=1000000+200000*m;div=100000+20000*m;newinv=1200000+100000*m;capitalfraction=[.60,.50,.40][m]
 add(f'Una sociedad tiene PN de {equity} €. Reparte {div} € de dividendos. Para una inversión de {newinv} €, los socios aportan nuevo capital por el {capitalfraction*100:g} % y el resto se financia con préstamo. Sin resultados ni otros cambios, ¿cuál es el PN tras las operaciones?',equity-div+newinv*capitalfraction,[equity+newinv-div,equity-div,equity+newinv*capitalfraction],f'PN = inicial − dividendos + aportación de capital = {equity} − {div} + {number(newinv*capitalfraction)}. El préstamo aumenta pasivo, no PN.',ctx=None)
 delivered1=200000+40000*m;delivered2=300000+50000*m;future=150000+20000*m;retention=[.15,.20,.10][m]
 add(f'Una empresa cobra el 10 % al recibir el pedido, el {90-retention*100:g} % a la entrega y el {retention*100:g} % seis meses después de entregar. A 31/12/X1: dos equipos de {delivered1} y {delivered2} € fueron entregados en diciembre; otro de {future} € se entregará en febrero X2 y solo tiene cobrado el anticipo. Los equipos de abril X1 ya se cobraron totalmente. Se reconocen ventas y clientes a la entrega y los anticipos como pasivo. ¿Cuál es el saldo de clientes al cierre de X1?',(delivered1+delivered2)*retention,[(delivered1+delivered2+future)*retention,(delivered1+delivered2)*retention+future*.90,delivered1+delivered2],f'Solo cuentan ventas ya entregadas y pendientes de cobro: ({delivered1} + {delivered2}) × {retention:g}. El pedido no entregado no genera cliente por venta; su anticipo es pasivo.',ctx=None)
 assert len(q)==20,len(q)
 return q

def accounting(out):
 exam=out['module-53416'];models=[]
 for phase,make in [('parcial',partial_account),('final',final_account)]:
  for m in range(3):
   # Keep old URLs alive for the final and expose explicit names in the index.
   mid=f'account-parcial-{m+1}' if phase=='parcial' else f'account-{m+1}'
   scoring=dict(correct=1 if phase=='parcial' else .5,wrong=-.33 if phase=='parcial' else -.16,proposed=False,note=f'Referencia del {phase} anterior: acierto +'+('1; error −0,33' if phase=='parcial' else '0,50; error −0,16')+'; blanco 0. No confirma las reglas de la convocatoria actual.')
   rows=make(m)
   models.append(dict(id=mid,title=f'Modelo {m+1} {phase}',questions=shuffled(rows,f'account-{phase}-{m}'),openQuestions=[],scoring=scoring))
 exam.update(models=models,format='Parcial: 10 preguntas · Final: 20 preguntas · Referencia: 75 minutos en ambos',scope='Tres parciales (10 preguntas sobre un caso contable completo) y tres finales (20 preguntas: proyecto de inversión, análisis económico-financiero y problemas individuales). Casos, cifras y respuestas nuevos; sigue los dos documentos aportados. Los datos desplegables de cada caso están disponibles junto a su pregunta. Puntuación: parcial +1/−0,33; final +0,50/−0,16; blanco 0, como referencia de los exámenes anteriores.')

def apply(out):
 economy(out);accounting(out)
 for sid in ['module-53375','module-53416']:
  exam=out[sid]
  assert len(exam['models'])==6
  stems=[]
  for model in exam['models']:
   assert len(model['questions'])==(10 if sid=='module-53416' and 'parcial' in model['title'] else 20)
   stems.extend(q['prompt'] for q in model['questions'])
   for q in model['questions']:
    assert len(q['options'])==len(set(q['options']))==4,(model['id'],q)
  assert len(stems)==len(set(stems)),(sid,'Repeated question stems')
