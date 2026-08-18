import CreateTask from "../components/CreateTask";

function CreateTaskPage() {

    return (
        <div>

            <div className="page-header">

                <div>
                    <h1 className="page-title">
                        Create Task
                    </h1>

                    <p className="page-subtitle">
                        Add a new task to your workspace.
                    </p>
                </div>

            </div>

            <CreateTask />

        </div>
    );
}

export default CreateTaskPage;