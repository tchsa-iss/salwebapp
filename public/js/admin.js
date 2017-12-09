function ShowLogs() {
	$.ajax({
		url: '/admin/logs/ALL',
		data: null,
		success: function(jsonObj) {
			if (!jsonObj) {
				alert("nothing came back");
			}
			var table = $('<table></table>').addClass('table-hover');
			for (var i = 0; i < jsonObj.length; i++) {
				var row = $('<tr></tr>').text(jsonObj[i]);
				table.append(row);
			}
			var contentArea = $('#dashboardContent');
			contentArea.append(table);
		}
	});
}