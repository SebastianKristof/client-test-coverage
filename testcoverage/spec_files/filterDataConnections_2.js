/* global Common */

var _dle = require( '../DataLoadEditor/DataLoadEditorPage' );

describe( "In order to be able to administer a lot of different data connections", function () {

	it( "should be possible to filter connections, both existing and connections created during filtering", function () {
		_dle.visitPage( "filterDataConnections_existing" );
		_dle.DataConnections().createNewConnection();
		_dle.DataConnections().Folder().createFolderConnector();
		_dle.DataConnections().Folder().configureFolder( Common.relativeToRootPath( "testcontent\\datasources\\FixedRecord" ), "1DelimitedFiles" );
		_dle.DataConnections().Folder().saveFolderConnection();
		_dle.DataConnections().createNewConnection();
		_dle.DataConnections().Odbc().createOdbcConnector();
		_dle.DataConnections().Odbc().setUserDsn();
		_dle.DataConnections().Odbc().setOdbcCredentials( "tester", "tester", "2Odbc" );
		_dle.DataConnections().Odbc().selectDsn( "ba-mssql2008" );
		_dle.DataConnections().Odbc().saveOdbcConnection();
        browser.sleep(2000);
        _dle.DataConnections().verifyNumberOfExistingDataConnections( 2 );
		_dle.DataConnections().filterDataConnections().input( "1" );
        browser.sleep(2000);
		_dle.DataConnections().verifyNumberOfExistingDataConnections( 1 );
		_dle.DataConnections().filterDataConnections().clear();
        browser.sleep(2000);
        _dle.DataConnections().verifyNumberOfExistingDataConnections( 2 );
		_dle.DataConnections().createNewConnection();
		_dle.DataConnections().Oledb().createOleDbConnector();
		_dle.DataConnections().Oledb().selectProvider( "Microsoft OLE DB Provider for SQL Server" );
		_dle.DataConnections().Oledb().setOleDbCredentials( "ba-mssql2008", "tester", "tester", "3OleDb" );
		_dle.DataConnections().Oledb().loadDatabases();
		_dle.DataConnections().Oledb().selectDatabase( "ConAdventureWorks" );
		_dle.DataConnections().Oledb().saveOleDbConnection();
        _dle.DataConnections().verifyNumberOfExistingDataConnections( 3 );
        _dle.DataConnections().filterDataConnections().input( "Files" );
		_dle.DataConnections().verifyNumberOfExistingDataConnections( 1 );
		_dle.DataConnections().createNewConnection();
        _dle.DataConnections().Folder().createFolderConnector();
		_dle.DataConnections().Folder().configureFolder( Common.relativeToRootPath( "testcontent\\datasources\\FixedRecord" ), "4DelimitedFilesAgain" );
		_dle.DataConnections().Folder().saveFolderConnection();
		_dle.DataConnections().createNewConnection();
		_dle.DataConnections().Folder().createFolderConnector();
		_dle.DataConnections().Folder().configureFolder( Common.relativeToRootPath( "testcontent\\datasources\\FixedRecord" ), "O4DelimitedFilesAgain" );
		_dle.DataConnections().Folder().saveFolderConnection();
		_dle.DataConnections().verifyNumberOfExistingDataConnections( 3 );
		_dle.DataConnections().filterDataConnections().clear();
		_dle.DataConnections().verifyNumberOfExistingDataConnections( 5 );
	} );
} );

afterAll(function(done){
    process.nextTick(done);
});
