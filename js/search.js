$(document).ready(function () {
        function signame(x) { return ('sig'+x); }
        function modname(x) { return ('mod'+x); }

        /* Convert an info description into HTML nodes */
        $.fn.addInfo = function(info) {  
            var s = info.description; /* TODO: rewrite the anchor tags within the descr */
            var d = $('<div />').addClass('sig-description').html(s);
            return $(this).append(d);
        }  

        /* Convert a signature data structure into HTML nodes */
        $.fn.addSig = function(sigdata) {
            function stripModule(x) { return x.replace(sigdata.module.name+".",''); }
            var name = sigdata.module.name;
            var modstruct = sigdata.module.module_structure;
            var d = $("<div />").attr('id', signame(name));
            d.append($("<div />")
                     .addClass('sig-header')
                     .append($("<h2 />").text(sigdata.module.name)));
            d.append($("<div />")
                     .addClass('sig-info')
                     .append($("<p/>").html(sigdata.module.info.description)));
            $.each(sigdata.module.module_structure, function(e,x) {
                    if (x.type) {
                        var s = "type ";
                        $.each(x.type.params, function (p,params) {
                                if (params.covariant && !params.contravariant) s += "+";
                                if (!params.covariant && params.contravariant) s += "-";
                                s = s + params.type + " ";
                            });
                        s += stripModule(x.type.name);
                        if (x.type.kind.type == "variant") {
                            s += " =";
                            $.each(x.type.kind.constructors, function(k,con) {
                                    s += "<br />| " + con.name;
                                    if (con.type.length > 0) s += " of " + $.map(con.type, stripModule).join(' * ');
                                    if (con.description) s += "  (* " + con.description + " *)";
                                });
                        }
                        d.append($("<div />")
                                 .addClass('sig-type')
                                 .addClass("alert-message block-message success")
                                 .append($("<div/>").addClass("alert-message success").html(s))
                                 .addInfo(x.type.info));
                    } else if (x.comment) {
                        d.append($("<div />")
                                 .addClass('sig-comment')
                                 .html($.trim(x.comment)));
                    } else if (x.value) {
                        var s = "val " + stripModule(x.value.name) + ": " + x.value.type;
                        d.append($("<div />")
                                 .addClass('sig-value')
                                 .addClass("alert-message block-message")
                                 .append($("<div/>").addClass("alert-message").html(s))
                                 .addInfo(x.value.info));
                    } else if (x.exception) {
                        var s = "exception " + x.exception.name;
                        d.append($("<div />")
                                 .addClass('sig-exception')
                                 .addClass("alert-message block-message info")
                                 .append($("<div/>").addClass("alert-message info").html(s))
                                 .addInfo(x.exception.info));
                    } else if (x.module_type) {
                        var s = "module type " + x.module_type.name + ": " + x.module_type.type;
                        d.append($("<div />")
                                 .addClass('sig-module-type')
                                 .addClass("alert-message block-message success")
                                 .append($("<div/>").addClass("alert-message success").html(s))
                                 .addInfo(x.module_type.info));
                    } else if (x.module) {
                        var s = "module " + x.module.name + ": " + x.module.type;
                        d.append($("<div />")
                                 .addClass('sig-module')
                                 .addClass("alert-message block-message")
                                 .append($("<div/>").addClass("alert-message").html(s))
                                 .addInfo(x.module.info));
                    } else {
                        d.append($("<div />")
                                 .addClass("alert-message block-message error")
                                 .html($("<pre>"+JSON.stringify(x)+"</pre>")));
                    }
                });
            return $(this).append(d);
        }

        $('#sigs').hide();

        function renderTree(data) {
            $('#thetree').jstree({
                    core: { animation: 20 },
                        plugins: ['themes', 'json_data', 'ui', 'search'],
                        themes: { icons: true, dots: true },
                        search: { show_only_matches: true, case_insensitive: true, },
                        UI: { select_limit:-1 },
                        json_data: { 'data' : data.tree }
                }).bind("select_node.jstree", function (e, id) { 
                        var a = $.jstree._focused().get_selected()[0].id.replace(/^tree/,"");
                        var e = $('#'+signame(a)).clone();
                        $('#center').html(e);
                    });
            $('#modsearch').keyup(function (e) { 
                    var v = $('#modsearch').val();
                    if (v == '') {
                        $('#thetree').jstree('clear_search');
                    } else {
                        $('#thetree').jstree('search', v);
                    }
                });
        }

        $.ajax({
                url: 'data/info.json',
                    dataType: 'json',
                    error: function(x) { console.log('ERR'+x); },
                    success: function(data) {
                    renderTree(data);
                    $.each(data.info, function(m) {
                            $('#sigs').addSig(data.info[m]);
                        });
                }
            });
    });
