/**
 * @copyright
 * Copyright © 2026 Apeleg Limited. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export * from './strings.js';

/* eslint-disable @typescript-eslint/naming-convention */
export const LANG_CODE_ = 'es';
export const LANG_DIR_ = 'ltr';
export const LANG_TEXT_ORIENTATION_ = null;
export const LANG_WRITING_MODE_ = null;

export const STRING__APELEG_ = 'Apeleg';
export const STRING__ARIA_LABEL_ATTRIBUTION_ = 'atribución';
export const STRING__APP_CONTROLS_ = 'Controles';
export const STRING__APP_COPY_SHAREABLE_URL_TO_CLIPBOARD_ =
	'Copiar URL compartible al portapapeles';
export const STRING__APP_ERROR_ = 'Error:';
export const STRING__APP_ERROR_BANNER_CAUSE_ = 'Causa';
export const STRING__APP_ERROR_BANNER_DETAILS_ = 'Detalles';
export const STRING__APP_ERROR_BANNER_NAME_ = 'Nombre';
export const STRING__APP_ERROR_BANNER_STACK_TRACE_ = 'Traza de pila';
export const STRING__APP_FAILED_TO_COPY_ = 'Error al copiar';
export const STRING__APP_INITIALISATION_FAILED_ = 'Error de carga';
export const STRING__APP_INITIALISING_BENCHMARK_STUDIO_ =
	'Cargando Benchmark Studio';
export const STRING__APP_INTERACTIVE_JAVASCRIPT_BENCHMARKING_IN_YOUR_BROWSER_ =
	'Evaluación interactiva del rendimiento de JavaScript en tu navegador';
export const STRING__APP_LINK_COPIED_ = '¡Enlace copiado!';
export const STRING__APP_PLEASE_RELOAD_THE_PAGE_TO_TRY_AGAIN_ =
	'Por favor, recargá la página para intentarlo de nuevo.';
export const STRING__APP_RELOAD_PAGE_ = 'Recargar página';
export const STRING__APP_SETTING_UP_THE_SANDBOXED_RUNNER_ENVIRONMENT_ =
	'Configurando el entorno de ejecución aislado…';
export const STRING__APP_SHARE_ = 'Compartir';
export const STRING__APP_SHARE_BENCHMARK_CONFIGURATION_ =
	'Compartir configuración del benchmark';
export const STRING__APP_TITLE_ = 'Benchmark Studio';

export const STRING__BASELINE_ALL_REPORTED_TIMES_HAVE_THIS_OVERHEAD_SUBTRACTED_ =
	'Todos los tiempos reportados tienen esta sobrecarga sustraída.';
export const STRING__BASELINE_BASELINE_ = 'Línea base';
export const STRING__BASELINE_CONSIDER_INCREASING_WORK_PER_ITERATION_FOR_MORE_ACCURATE_RESULTS_ =
	'Considerá aumentar el trabajo por iteración para obtener resultados más precisos.';
export const STRING__BASELINE_MEASUREMENT_OVERHEAD_ = 'Sobrecarga de medición';
export const STRING__BASELINE_OVERHEAD_NEGLIGIBLE_ = 'despreciable';
export const STRING__BASELINE_HIGH_OVERHEAD_ = [
	'La sobrecarga es ',
	' de la función más rápida',
];
export const STRING__BASELINE_OVERHEAD_IS_ = [
	'La sobrecarga es ',
	' de la más rápida —',
];
export const STRING__BASELINE_PER_ITERATION_ = ['', '/iter'];

export const STRING__BUILD_INFORMATION_VERSION_ = [
	'Información de compilación: ',
	' ',
	' ',
	'',
];

export const STRING__COMPARISONS_95_PERCENT_CI_PREFIX_ = 'IC del 95% [';
export const STRING__COMPARISONS_95_PERCENT_CI_SEPARATOR_ = ', ';
export const STRING__COMPARISONS_95_PERCENT_CI_SUFFIX_ = ']';
export const STRING__COMPARISONS_DELTA_PREFIX_ = 'Δ = ';
export const STRING__COMPARISONS_DF_PREFIX_ = 'df = ';
export const STRING__COMPARISONS_FASTER_ = [
	'✓',
	' ',
	' es ',
	' más rápido ',
	'',
];
export const STRING__COMPARISONS_NO_SIGNIFICANT_DIFFERENCE_ = [
	'≈',
	' Sin diferencia significativa ',
	'',
];
export const STRING__COMPARISONS_PAIRED_T_TEST_ =
	'Comparaciones por pares (prueba t pareada)';
export const STRING__COMPARISONS_SE_DELTA_PREFIX_ = 'SE(Δ) = ';
export const STRING__COMPARISONS_T_PREFIX_ = 't = ';
export const STRING__COMPARISONS_VS_ = ['', ' vs ', ''];

export const STRING__COPYRIGHT_YEAR_ALL_RIGHTS_RESERVED_ = [
	'© ',
	' Apeleg Limited. Todos los derechos reservados.',
];

export const STRING__DETAILED_STATISTICS_ = 'Estadísticas detalladas';
export const STRING__DETAILED_STATISTICS_ARIA_LABEL_ =
	'Estadísticas detalladas de funciones';
export const STRING__DETAILED_STATISTICS_COEFFICIENT_OF_VARIATION_ =
	'Coeficiente de variación';
export const STRING__DETAILED_STATISTICS_CV_ = 'CV';
export const STRING__DETAILED_STATISTICS_FUNCTION_ = 'Función';
export const STRING__DETAILED_STATISTICS_MAX_ = 'Máx';
export const STRING__DETAILED_STATISTICS_MAXIMUM_ = 'Máximo';
export const STRING__DETAILED_STATISTICS_MEAN_ = 'Media';
export const STRING__DETAILED_STATISTICS_MEDIAN_ = 'Mediana';
export const STRING__DETAILED_STATISTICS_MIN_ = 'Mín';
export const STRING__DETAILED_STATISTICS_MINIMUM_ = 'Mínimo';
export const STRING__DETAILED_STATISTICS_SEM_ = 'SEM';
export const STRING__DETAILED_STATISTICS_STANDARD_DEVIATION_ =
	'Desviación estándar';
export const STRING__DETAILED_STATISTICS_STANDARD_ERROR_OF_THE_MEAN_ =
	'Error estándar de la media';
export const STRING__DETAILED_STATISTICS_STD_DEV_ = 'Desv Est';

export const STRING__DISTRIBUTION_ = 'Distribución';
export const STRING__DISTRIBUTION_ARIA_LABEL_ =
	'Gráfico de caja que muestra los rangos percentiles de cada función';
export const STRING__DISTRIBUTION_IQR_ = 'IQR';
export const STRING__DISTRIBUTION_INTERQUARTILE_RANGE_ =
	'Rango intercuartílico';
export const STRING__DISTRIBUTION_MEDIAN_ = 'mediana';
export const STRING__DISTRIBUTION_P25_ = 'p25';
export const STRING__DISTRIBUTION_P5_ = 'p5';
export const STRING__DISTRIBUTION_P75_ = 'p75';
export const STRING__DISTRIBUTION_P95_ = 'p95';
export const STRING__DISTRIBUTION_PERCENTILE_05_ = '5.\u00ba percentil';
export const STRING__DISTRIBUTION_PERCENTILE_25_ = '25.\u00ba percentil';
export const STRING__DISTRIBUTION_PERCENTILE_75_ = '75.\u00ba percentil';
export const STRING__DISTRIBUTION_PERCENTILE_95_ = '95.\u00ba percentil';
export const STRING__DISTRIBUTION_SAMPLES_ = 'muestras';
export const STRING__DISTRIBUTION_WHISKERS_ = 'bigotes';

export const STRING__DOWNLOAD_REPORT_ARIA_LABEL_ = 'Exportar';
export const STRING__DOWNLOAD_REPORT_ARIA_LABEL_MENU_ =
	'Descargar informe como';
export const STRING__DOWNLOAD_REPORT_CI_FRIENDLY_XML_EXPORT_ =
	'Exportación XML compatible con CI';
export const STRING__DOWNLOAD_REPORT_DOWNLOAD_REPORT_ = 'Descargar informe';
export const STRING__DOWNLOAD_REPORT_EXPORT_ = 'Exportar';
export const STRING__DOWNLOAD_REPORT_JSON_ = 'JSON';
export const STRING__DOWNLOAD_REPORT_LOADING_REPORTER_AND_GENERATING_XML_ =
	'Cargando el generador de informes y generando XML';
export const STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_ = 'Preparando xUnit…';
export const STRING__DOWNLOAD_REPORT_PREPARING_XUNIT_EXPORT_ =
	'Preparando la exportación xUnit…';
export const STRING__DOWNLOAD_REPORT_RAW_SUITE_REPORT_ =
	'Informe en bruto de la suite';
export const STRING__DOWNLOAD_REPORT_UNABLE_TO_PREPARE_XUNIT_EXPORT_ =
	'No se pudo preparar la exportación xUnit.';
export const STRING__DOWNLOAD_REPORT_XUNIT_ = 'xUnit';

export const STRING__FOOTER_HOME_LINK_ = 'Inicio';
export const STRING__FOOTER_SOURCE_CODE_LINK_ = 'Código fuente';

export const STRING__FUNCTION_EDITOR_BENCHMARK_FUNCTION_ = [
	'Función de benchmark: ',
	'',
];
export const STRING__FUNCTION_EDITOR_CODE_ = 'Código';
export const STRING__FUNCTION_EDITOR_FUNCTION_NAME_ = 'Nombre de la función';
export const STRING__FUNCTION_EDITOR_JAVASCRIPT_CODE_TO_BENCHMARK_ =
	'// Código JavaScript para evaluar';
export const STRING__FUNCTION_EDITOR_NAME_ = 'Nombre';
export const STRING__FUNCTION_EDITOR_REMOVE_ = ['Eliminar ', ''];
export const STRING__FUNCTION_EDITOR_REMOVE_THIS_FUNCTION_ =
	'Eliminar esta función';

export const STRING__FUNCTION_LIST_ADD_FUNCTION_ = 'Agregar función';
export const STRING__FUNCTION_LIST_BENCHMARK_FUNCTIONS_ =
	'Funciones de benchmark';
export const STRING__FUNCTION_LIST_FUNCTIONS_ = 'Funciones';
export const STRING__FUNCTION_LIST_PLUS_ADD_FUNCTION_ = '+ Agregar función';

export const STRING__HEADER_IMPORTS_BODY_ = 'Cuerpo de importaciones';
export const STRING__HEADER_ITERATIONS_PER_TRIAL_ = 'Iteraciones / Prueba';
export const STRING__HEADER_SETUP_FUNCTION_BODY_ =
	'Cuerpo de la función de preparación';
export const STRING__HEADER_SUITE_CONFIGURATION_ = 'Configuración de la suite';
export const STRING__HEADER_SUITE_IMPORTS_ = 'Importaciones de la suite';
export const STRING__HEADER_SUITE_IMPORTS_OPTIONAL_ =
	'(opcional — disponible para cada función)';
export const STRING__HEADER_SUITE_NAME_ = 'Nombre de la suite';
export const STRING__HEADER_SUITE_SETUP_CODE_ =
	'Código de preparación de la suite';
export const STRING__HEADER_SUITE_SETUP_OPTIONAL_ =
	'(opcional — se ejecuta antes de cada función)';
export const STRING__HEADER_SUITE_TEARDOWN_CODE_ =
	'Código de limpieza de la suite';
export const STRING__HEADER_SUITE_TEARDOWN_OPTIONAL_ =
	'(opcional — se ejecuta después de cada función)';
export const STRING__HEADER_TEARDOWN_FUNCTION_BODY_ =
	'Cuerpo de la función de limpieza';
export const STRING__HEADER_TRIALS_ = 'Pruebas';
export const STRING__HEADER_WARMUP_ITERATIONS_ = 'Iteraciones de calentamiento';
export const STRING__HEADER_PLACEHOLDER_IMPORTS_ =
	"// p. ej. import semver from 'npm:semver';";
export const STRING__HEADER_PLACEHOLDER_SETUP_ =
	"// p. ej. this.data = Array.from({ length: 1000 }, () => Math.random());";
export const STRING__HEADER_PLACEHOLDER_TEARDOWN_ =
	'// p. ej. delete this.data;';

export const STRING__LEADERBOARD_ARIA_LABEL_ = 'Clasificación del benchmark';
export const STRING__LEADERBOARD_FASTEST_ = 'más rápido';
export const STRING__LEADERBOARD_FUNCTION_ = 'Función';
export const STRING__LEADERBOARD_LEADERBOARD_ = 'Clasificación';
export const STRING__LEADERBOARD_MARGIN_OF_ERROR_ = 'Margen de error';
export const STRING__LEADERBOARD_MEAN_ = 'Media';
export const STRING__LEADERBOARD_MOE_ = 'MOE';
export const STRING__LEADERBOARD_OPS_PER_SECOND_ = 'ops/s';
export const STRING__LEADERBOARD_RANK_ = ['Puesto \u2116', ''];
export const STRING__LEADERBOARD_RELATIVE_ = 'Relativo';
export const STRING__LEADERBOARD_RELATIVE_THROUGHPUT_ = [
	'',
	'% de rendimiento relativo',
];
export const STRING__LEADERBOARD_SLOWER_ = ['', ' más lento'];

export const STRING__LANGUAGE_SELECTOR_ACTIVE_LANGUAGE_NAME_ = 'castellano';
export const STRING__LANGUAGE_SELECTOR_ARIA_LABEL_ = ['Idioma actual: ', ''];
export const STRING__LANGUAGE_SELECTOR_ARIA_LABEL_MENU_ = 'Seleccionar idioma';
export const STRING__LANGUAGE_SELECTOR_TITLE_ = 'Idiomas';

export const STRING__MADE_WITH_LOVE_BY_ = ['Hecho con ❤️ por ', ''];

export const STRING__REPORT_VIEW_BENCHMARK_RESULTS_ =
	'Resultados del benchmark';
export const STRING__REPORT_VIEW_ITERATIONS_PER_TRIAL_SHORT_ = [
	'',
	' iter/prueba',
];
export const STRING__REPORT_VIEW_NO_BENCHMARK_FUNCTIONS_FOUND_IN_THE_REPORT_ =
	'No se encontraron funciones de benchmark en el informe.';
export const STRING__REPORT_VIEW_NOT_SIGNIFICANT_ = 'no significativo';
export const STRING__REPORT_VIEW_PAIRED_T_TEST_ON_BASELINE_CORRECTED_PER_ITERATION_TIMES_ =
	'Prueba t pareada sobre tiempos por iteración con corrección de línea base.';
export const STRING__REPORT_VIEW_SIGNIFICANCE_ = 'Significancia:';
export const STRING__REPORT_VIEW_TRIALS_SHORT_ = ['', ' pruebas'];
export const STRING__REPORT_VIEW_WARMUP_SHORT_ = ['', ' calentamiento'];

export const STRING__RUN_BUTTON_BASELINE_ = 'línea base';
export const STRING__RUN_BUTTON_BENCHMARK_IS_RUNNING_ =
	'El benchmark se está ejecutando';
export const STRING__RUN_BUTTON_RUN_BENCHMARK_ = 'Ejecutar benchmark';
export const STRING__RUN_BUTTON_RUNNING_ = 'Ejecutando…';
export const STRING__RUN_BUTTON_RUN_BENCHMARK_LABEL_ = '▶ Ejecutar benchmark';
export const STRING__RUN_BUTTON_TRIAL_ = ['Prueba ', '/', ''];

export const STRING__RUNNER_FAILED_TO_DESERIALISE_INITIAL_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_ =
	'No se pudo deserializar el mensaje inicial de saludo del iframe del runner.';
export const STRING__RUNNER_FAILED_TO_DESERIALISE_INSTANCE_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_ =
	'No se pudo deserializar el mensaje de saludo de la instancia del iframe del runner.';
export const STRING__RUNNER_ERROR_STARTING_WEB_WORKER_ =
	'Error al iniciar el web worker';
export const STRING__RUNNER_INVALID_DATA_ = 'Datos no válidos';
export const STRING__RUNNER_MESSAGE_ERROR_ = 'Error de mensaje';
export const STRING__RUNNER_TIMED_OUT_WAITING_FOR_HANDSHAKE_MESSAGE_FROM_RUNNER_IFRAME_ =
	'Se agotó el tiempo de espera del mensaje de saludo del iframe del runner.';

export const STRING__SPEED_MATRIX_ = 'Matriz de velocidad';
export const STRING__SPEED_MATRIX_ARIA_LABEL_ =
	'Matriz de comparación de velocidad';
export const STRING__SPEED_MATRIX_CAPTION_ =
	'Celda = tiempo de columna ÷ tiempo de fila';
export const STRING__SPEED_MATRIX_GREEN_GT_1_ =
	'verde > 1 (la fila es más rápida)';
export const STRING__SPEED_MATRIX_RED_LT_1_ = 'rojo < 1 (la fila es más lenta)';
export const STRING__SPEED_MATRIX_SIGNIFICANT_ = ['', ' significativo'];
export const STRING__SPEED_MATRIX_RAW_RATIOS_ =
	'Se muestran las proporciones en bruto — algunas mediciones con ajustes de línea base quedan en o por debajo del nivel de ruido, lo que hace que las proporciones ajustadas sean poco fiables.';

export const STRING__WINNER_FASTEST_ = ['', ' es el más rápido '];
export const STRING__WINNER_FASTER_THAN_ = ['— ', ' más rápido que ', ' vs '];
export const STRING__WINNER_STATISTICALLY_TIED_ = [
	'',
	' y ',
	' están ',
	' estadísticamente empatados',
	' ',
	'',
];

export const STRING_CM_EDITOR_ESCAPE_HATCH_ = [
	'Presioná ',
	', luego ',
	' o ',
	' para salir del editor.',
];
export const STRING_KBD_KEY_ESCAPE_ = 'Escape';
export const STRING_KBD_KEY_TAB_ = 'Tab\u202f\u2b7e';
export const STRING_KBD_KEY_SHIFT_TAB_ = [
	'\u21e7\u202fMayús',
	'\u2013',
	'Tab\u202f\u2b7e',
];
